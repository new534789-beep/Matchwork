/**
 * Ingestion d'offres d'emploi depuis les plateformes ATS (Greenhouse, Lever, Ashby, SmartRecruiters).
 * Appelle les APIs JSON publiques, normalise, déduplique et insère en base via Prisma.
 */
import { prisma } from "@/lib/prisma";
import { calculerDedupKey } from "@/lib/ingestion/dedup";

// ── Registre des entreprises ──────────────────────────────────────────────────

type Platform = "greenhouse" | "lever" | "ashby" | "smartrecruiters";

interface Company {
  name: string;
  platform: Platform;
  identifier: string;
}

const COMPANIES: Company[] = [
  // Greenhouse
  { name: "Stripe", platform: "greenhouse", identifier: "stripe" },
  { name: "Airbnb", platform: "greenhouse", identifier: "airbnb" },
  { name: "Cloudflare", platform: "greenhouse", identifier: "cloudflare" },
  { name: "Figma", platform: "greenhouse", identifier: "figma" },
  { name: "Discord", platform: "greenhouse", identifier: "discord" },
  { name: "Databricks", platform: "greenhouse", identifier: "databricks" },
  { name: "Coinbase", platform: "greenhouse", identifier: "coinbase" },
  { name: "Twilio", platform: "greenhouse", identifier: "twilio" },
  { name: "MongoDB", platform: "greenhouse", identifier: "mongodb" },
  { name: "Elastic", platform: "greenhouse", identifier: "elastic" },
  { name: "GitLab", platform: "greenhouse", identifier: "gitlab" },
  { name: "Webflow", platform: "greenhouse", identifier: "webflow" },
  { name: "Vercel", platform: "greenhouse", identifier: "vercel" },
  { name: "Tailscale", platform: "greenhouse", identifier: "tailscale" },
  { name: "CockroachDB", platform: "greenhouse", identifier: "cockroachlabs" },
  { name: "PlanetScale", platform: "greenhouse", identifier: "planetscale" },
  { name: "Gusto", platform: "greenhouse", identifier: "gusto" },
  { name: "Squarespace", platform: "greenhouse", identifier: "squarespace" },
  { name: "Watershed", platform: "greenhouse", identifier: "watershed" },
  { name: "Netlify", platform: "greenhouse", identifier: "netlify" },
  { name: "Lucid Motors", platform: "greenhouse", identifier: "lucidmotors" },
  // Lever
  { name: "Palantir", platform: "lever", identifier: "palantir" },
  { name: "Spotify", platform: "lever", identifier: "spotify" },
  // Ashby
  { name: "OpenAI", platform: "ashby", identifier: "openai" },
  { name: "Cursor", platform: "ashby", identifier: "cursor" },
  { name: "Replit", platform: "ashby", identifier: "replit" },
  { name: "Cohere", platform: "ashby", identifier: "cohere" },
  { name: "Notion", platform: "ashby", identifier: "notion" },
  { name: "Supabase", platform: "ashby", identifier: "supabase" },
  { name: "Linear", platform: "ashby", identifier: "linear" },
  { name: "Render", platform: "ashby", identifier: "render" },
  { name: "Neon", platform: "ashby", identifier: "neon" },
  { name: "Ramp", platform: "ashby", identifier: "ramp" },
  { name: "Ashby", platform: "ashby", identifier: "ashby" },
  { name: "Applied Intuition", platform: "ashby", identifier: "applied" },
  { name: "Gecko Robotics", platform: "ashby", identifier: "gecko-robotics" },
  { name: "Boom Supersonic", platform: "ashby", identifier: "boom" },
  // SmartRecruiters
  { name: "Bosch", platform: "smartrecruiters", identifier: "BoschGroup" },
  { name: "Continental", platform: "smartrecruiters", identifier: "Continental" },
  { name: "Thales", platform: "smartrecruiters", identifier: "Thales" },
];

// ── Types internes ────────────────────────────────────────────────────────────

interface RawJob {
  title: string;
  location: string;
  department: string | null;
  description: string;
  url: string;
  postedDate: Date | null;
  company: string;
  platform: string;
}

// ── Adaptateurs (fetch brut → RawJob[]) ───────────────────────────────────────

async function fetchGreenhouseJobs(identifier: string, company: string): Promise<RawJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${identifier}/jobs`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`Greenhouse ${identifier}: HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs ?? []).map((j: any) => ({
    title: j.title ?? "",
    location: j.location?.name ?? "Unknown",
    department: j.departments?.[0]?.name ?? null,
    description: "",
    url: j.absolute_url ?? "",
    postedDate: j.updated_at ? new Date(j.updated_at) : null,
    company,
    platform: "greenhouse",
  }));
}

async function fetchLeverJobs(identifier: string, company: string): Promise<RawJob[]> {
  const url = `https://api.lever.co/v0/postings/${identifier}?mode=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`Lever ${identifier}: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((p: any) => ({
    title: p.text ?? "",
    location: p.categories?.location ?? "Unknown",
    department: p.categories?.team ?? null,
    description: (p.descriptionPlain ?? "").slice(0, 2000),
    url: p.hostedUrl ?? "",
    postedDate: p.createdAt ? new Date(p.createdAt) : null,
    company,
    platform: "lever",
  }));
}

async function fetchAshbyJobs(identifier: string, company: string): Promise<RawJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${identifier}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`Ashby ${identifier}: HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs ?? []).map((j: any) => ({
    title: j.title ?? "",
    location: j.location ?? "Unknown",
    department: j.department ?? j.team ?? null,
    description: (j.descriptionPlain ?? "").slice(0, 2000),
    url: j.jobUrl ?? j.applyUrl ?? "",
    postedDate: j.publishedAt ? new Date(j.publishedAt) : null,
    company,
    platform: "ashby",
  }));
}

async function fetchSmartRecruitersJobs(identifier: string, company: string): Promise<RawJob[]> {
  const baseUrl = `https://api.smartrecruiters.com/v1/companies/${identifier}/postings`;
  const jobs: RawJob[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(`${baseUrl}?limit=${limit}&offset=${offset}`, {
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`SmartRecruiters ${identifier}: HTTP ${res.status}`);
    const data = await res.json();
    const postings = data.content ?? [];
    if (postings.length === 0) break;

    for (const p of postings) {
      const loc = p.location ?? {};
      const locStr = [loc.city, loc.country].filter(Boolean).join(", ") || "Unknown";
      jobs.push({
        title: p.name ?? "",
        location: locStr,
        department: p.department?.label ?? null,
        description: "",
        url: p.ref ?? "",
        postedDate: p.releasedDate ? new Date(p.releasedDate) : null,
        company,
        platform: "smartrecruiters",
      });
    }

    offset += limit;
    if (offset >= (data.totalFound ?? 0)) break;
  }
  return jobs;
}

const FETCHERS: Record<Platform, (id: string, company: string) => Promise<RawJob[]>> = {
  greenhouse: fetchGreenhouseJobs,
  lever: fetchLeverJobs,
  ashby: fetchAshbyJobs,
  smartrecruiters: fetchSmartRecruitersJobs,
};

// ── Pipeline d'ingestion ──────────────────────────────────────────────────────

export type RapportATS = {
  entreprises: number;
  offresLues: number;
  creees: number;
  doublons: number;
  erreurs: number;
  details: { entreprise: string; plateforme: string; offres: number; erreur?: string }[];
};

export async function ingererOffresATS(): Promise<RapportATS> {
  const rapport: RapportATS = {
    entreprises: COMPANIES.length,
    offresLues: 0,
    creees: 0,
    doublons: 0,
    erreurs: 0,
    details: [],
  };

  for (const company of COMPANIES) {
    const fetcher = FETCHERS[company.platform];
    try {
      const jobs = await fetcher(company.identifier, company.name);
      rapport.offresLues += jobs.length;

      let creeesCompany = 0;
      for (const job of jobs) {
        if (!job.title || !job.url) continue;

        const dedupKey = calculerDedupKey(undefined, job.url, job.title);
        const maintenant = new Date();

        const existe = await prisma.opportunite.findUnique({
          where: { dedupKey },
          select: { id: true },
        });
        if (existe) {
          rapport.doublons++;
          await prisma.opportunite.update({
            where: { id: existe.id },
            data: { derniereVerif: maintenant },
          }).catch(() => {});
          continue;
        }

        try {
          await prisma.opportunite.create({
            data: {
              type: "EMPLOI",
              source: `ATS:${company.platform}`,
              organisme: company.name,
              intitule: job.title.slice(0, 240),
              description: job.description || `Poste chez ${company.name}`,
              langueDetectee: "en",
              conditions: job.location !== "Unknown" ? `Localisation : ${job.location}` : null,
              piecesExigees: "[]",
              dateLimite: null,
              lien: job.url,
              sourceUrl: job.url,
              dedupKey,
              hash: undefined,
              datePublication: job.postedDate,
              premiereVue: maintenant,
              derniereVerif: maintenant,
              confianceDateLimite: null,
              sourceDateLimite: null,
              statut: "a_valider",
              actif: false,
            },
          });
          creeesCompany++;
          rapport.creees++;
        } catch {
          rapport.doublons++;
        }
      }

      rapport.details.push({
        entreprise: company.name,
        plateforme: company.platform,
        offres: jobs.length,
      });
    } catch (e) {
      rapport.erreurs++;
      rapport.details.push({
        entreprise: company.name,
        plateforme: company.platform,
        offres: 0,
        erreur: e instanceof Error ? e.message.slice(0, 200) : "Erreur inconnue",
      });
    }

    // Rate limiting basique
    await new Promise((r) => setTimeout(r, 500));
  }

  return rapport;
}

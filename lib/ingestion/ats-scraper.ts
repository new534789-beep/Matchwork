/**
 * Ingestion massive d'offres d'emploi depuis les plateformes ATS.
 * APIs JSON publiques → extraction IA (Mistral) → déduplique → insère en base.
 * Traitement parallèle : 5 entreprises simultanées, 10 jobs concurrents par entreprise.
 */
import { prisma } from "@/lib/prisma";
import { calculerDedupKey } from "@/lib/ingestion/dedup";
import { extraireOffre, iaDisponible, normaliserCanal } from "@/lib/ia/extraction-offre";
import { recupererContenuPage } from "@/lib/ingestion/contenu-page";
import { offreAtsPertinenteGeographiquement } from "@/lib/ingestion/geo-filtre";

// ── Registre des entreprises ──────────────────────────────────────────────────

export type Platform = "greenhouse" | "lever" | "ashby" | "smartrecruiters";

export interface Company {
  name: string;
  platform: Platform;
  identifier: string;
}

// Uniquement les entreprises dont l'API a répondu avec des offres (vérifié)
export const COMPANIES: Company[] = [
  // ── Greenhouse (vérifié) ──
  { name: "Stripe", platform: "greenhouse", identifier: "stripe" },
  { name: "Airbnb", platform: "greenhouse", identifier: "airbnb" },
  { name: "Cloudflare", platform: "greenhouse", identifier: "cloudflare" },
  { name: "Figma", platform: "greenhouse", identifier: "figma" },
  { name: "Discord", platform: "greenhouse", identifier: "discord" },
  { name: "Databricks", platform: "greenhouse", identifier: "databricks" },
  { name: "Coinbase", platform: "greenhouse", identifier: "coinbase" },
  { name: "Twilio", platform: "greenhouse", identifier: "twilio" },
  { name: "MongoDB", platform: "greenhouse", identifier: "mongodb" },
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
  { name: "Instacart", platform: "greenhouse", identifier: "instacart" },
  { name: "Pinterest", platform: "greenhouse", identifier: "pinterest" },
  { name: "Lyft", platform: "greenhouse", identifier: "lyft" },
  { name: "Reddit", platform: "greenhouse", identifier: "reddit" },
  { name: "Dropbox", platform: "greenhouse", identifier: "dropbox" },
  { name: "Asana", platform: "greenhouse", identifier: "asana" },
  { name: "Datadog", platform: "greenhouse", identifier: "datadog" },
  { name: "Zscaler", platform: "greenhouse", identifier: "zscaler" },
  { name: "Airtable", platform: "greenhouse", identifier: "airtable" },
  { name: "Calendly", platform: "greenhouse", identifier: "calendly" },
  { name: "Brex", platform: "greenhouse", identifier: "brex" },
  { name: "Robinhood", platform: "greenhouse", identifier: "robinhood" },
  { name: "Chime", platform: "greenhouse", identifier: "chime" },
  { name: "Affirm", platform: "greenhouse", identifier: "affirm" },
  { name: "Toast", platform: "greenhouse", identifier: "toast" },
  { name: "Bill.com", platform: "greenhouse", identifier: "billcom" },
  { name: "Amplitude", platform: "greenhouse", identifier: "amplitude" },
  { name: "Mixpanel", platform: "greenhouse", identifier: "mixpanel" },
  { name: "LaunchDarkly", platform: "greenhouse", identifier: "launchdarkly" },
  { name: "Postman", platform: "greenhouse", identifier: "postman" },
  { name: "JFrog", platform: "greenhouse", identifier: "jfrog" },
  { name: "CircleCI", platform: "greenhouse", identifier: "circleci" },
  { name: "Samsara", platform: "greenhouse", identifier: "samsara" },
  { name: "Nuro", platform: "greenhouse", identifier: "nuro" },
  { name: "Waymo", platform: "greenhouse", identifier: "waymo" },
  { name: "SpaceX", platform: "greenhouse", identifier: "spacex" },
  { name: "Flexport", platform: "greenhouse", identifier: "flexport" },
  { name: "Faire", platform: "greenhouse", identifier: "faire" },
  { name: "StockX", platform: "greenhouse", identifier: "stockx" },
  { name: "SingleStore", platform: "greenhouse", identifier: "singlestore" },
  { name: "Neo4j", platform: "greenhouse", identifier: "neo4j" },
  { name: "ClickHouse", platform: "greenhouse", identifier: "clickhouse" },
  { name: "Scale AI", platform: "greenhouse", identifier: "scaleai" },
  { name: "Anthropic", platform: "greenhouse", identifier: "anthropic" },
  { name: "AssemblyAI", platform: "greenhouse", identifier: "assemblyai" },
  { name: "Stability AI", platform: "greenhouse", identifier: "stabilityai" },
  { name: "Abnormal Security", platform: "greenhouse", identifier: "abnormalsecurity" },
  { name: "Cribl", platform: "greenhouse", identifier: "cribl" },
  { name: "Starburst", platform: "greenhouse", identifier: "starburst" },
  // ── Lever (vérifié) ──
  { name: "Netflix", platform: "lever", identifier: "netflix" },
  { name: "Ledger", platform: "lever", identifier: "ledger" },
  { name: "BlaBlaCar", platform: "lever", identifier: "blablacar" },
  { name: "ContentSquare", platform: "lever", identifier: "contentsquare" },
  // ── Ashby (vérifié) ──
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
  { name: "Applied Intuition", platform: "ashby", identifier: "applied" },
  { name: "Gecko Robotics", platform: "ashby", identifier: "gecko-robotics" },
  { name: "Boom Supersonic", platform: "ashby", identifier: "boom" },
  { name: "Perplexity", platform: "ashby", identifier: "perplexity" },
  { name: "Railway", platform: "ashby", identifier: "railway" },
  { name: "Resend", platform: "ashby", identifier: "resend" },
  { name: "Warp", platform: "ashby", identifier: "warp" },
  { name: "Coder", platform: "ashby", identifier: "coder" },
  { name: "Mintlify", platform: "ashby", identifier: "mintlify" },
  { name: "Inngest", platform: "ashby", identifier: "inngest" },
  { name: "Trigger.dev", platform: "ashby", identifier: "triggerdev" },
  { name: "Knock", platform: "ashby", identifier: "knock" },
  { name: "Temporal", platform: "ashby", identifier: "temporal" },
  { name: "Prefect", platform: "ashby", identifier: "prefect" },
  { name: "Modal", platform: "ashby", identifier: "modal" },
  // ── SmartRecruiters (vérifié) ──
  { name: "Bosch", platform: "smartrecruiters", identifier: "BoschGroup" },
  { name: "Continental", platform: "smartrecruiters", identifier: "Continental" },
  { name: "Thales", platform: "smartrecruiters", identifier: "Thales" },
  { name: "Visa", platform: "smartrecruiters", identifier: "Visa" },
];

// ── Concurrence ──────────────────────────────────────────────────────────────

const PARALLEL_COMPANIES = 2;
const PARALLEL_JOBS = 4;

async function parallel<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.allSettled(workers);
}

async function fetchAvecRetry(url: string, tentatives = 3): Promise<Response> {
  for (let i = 0; i < tentatives; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      return res;
    } catch (e) {
      if (i === tentatives - 1) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error("fetch failed after retries");
}

// ── Types internes ────────────────────────────────────────────────────────────

export interface RawJob {
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
  const res = await fetchAvecRetry(url);
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
  const res = await fetchAvecRetry(url);
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
  const res = await fetchAvecRetry(url);
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
    const res = await fetchAvecRetry(`${baseUrl}?limit=${limit}&offset=${offset}`);
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

export const FETCHERS: Record<Platform, (id: string, company: string) => Promise<RawJob[]>> = {
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
  horsZone: number;
  erreurs: number;
  details: { entreprise: string; plateforme: string; offres: number; creees: number; erreur?: string }[];
};

async function traiterJob(job: RawJob, rapport: RapportATS, company: Company): Promise<void> {
  if (!job.title || !job.url) return;

  if (!offreAtsPertinenteGeographiquement(job.location)) {
    rapport.horsZone++;
    return;
  }

  const dedupKey = calculerDedupKey(undefined, job.url, job.title);
  const maintenant = new Date();

  const existe = await prisma.opportunite.findUnique({
    where: { dedupKey },
    select: { id: true },
  });
  if (existe) {
    rapport.doublons++;
    return;
  }

  if (!iaDisponible()) return;

  const contenu = await recupererContenuPage(job.url);
  if (!contenu) return;

  const offre = await extraireOffre(`${job.title}\n\n${contenu}`);
  if (!offre) return;

  let intitule = job.title.slice(0, 240);
  let description = job.description || `Poste chez ${company.name}`;
  let conditions: string | null = job.location !== "Unknown" ? `Localisation : ${job.location}` : null;
  let piecesExigees = "[]";
  let exigenceLangue: string | null = null;
  let langueDetectee = "fr";
  let canalCandidature: string | null = null;
  let cibleCandidature: string | null = null;

  if (offre.intitule && offre.intitule !== "non précisé") intitule = offre.intitule.slice(0, 240);
  if (offre.description && offre.description !== "non précisé") description = offre.description.slice(0, 2000);
  if (offre.conditions && offre.conditions !== "non précisé") conditions = offre.conditions;
  if (Array.isArray(offre.piecesExigees) && offre.piecesExigees.length) piecesExigees = JSON.stringify(offre.piecesExigees);
  if (offre.exigenceLangue && offre.exigenceLangue !== "non précisé") exigenceLangue = offre.exigenceLangue;
  if (offre.langueDetectee) langueDetectee = offre.langueDetectee;
  canalCandidature = normaliserCanal(offre.canalCandidature);
  cibleCandidature = offre.cibleCandidature ?? null;

  try {
    await prisma.opportunite.create({
      data: {
        type: "EMPLOI",
        source: `ATS:${company.platform}`,
        organisme: company.name,
        intitule,
        description,
        contenuBrut: contenu.slice(0, 15000),
        langueDetectee,
        conditions,
        piecesExigees,
        exigenceLangue,
        canalCandidature,
        cibleCandidature,
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
    rapport.creees++;
  } catch {
    rapport.doublons++;
  }
}

async function traiterEntreprise(company: Company, rapport: RapportATS, log: (msg: string) => void): Promise<void> {
  const fetcher = FETCHERS[company.platform];
  try {
    const jobs = await fetcher(company.identifier, company.name);
    rapport.offresLues += jobs.length;
    const avantCreees = rapport.creees;

    await parallel(jobs, PARALLEL_JOBS, (job) => traiterJob(job, rapport, company));

    const creeesCompany = rapport.creees - avantCreees;
    rapport.details.push({
      entreprise: company.name,
      plateforme: company.platform,
      offres: jobs.length,
      creees: creeesCompany,
    });
    log(`  ${company.name} (${company.platform}) → ${jobs.length} offres, ${creeesCompany} créées`);
  } catch (e) {
    rapport.erreurs++;
    const erreur = e instanceof Error ? e.message.slice(0, 200) : "Erreur inconnue";
    rapport.details.push({
      entreprise: company.name,
      plateforme: company.platform,
      offres: 0,
      creees: 0,
      erreur,
    });
    log(`  ${company.name} (${company.platform}) → ERREUR: ${erreur.slice(0, 80)}`);
  }
}

export async function ingererOffresATS(log: (msg: string) => void = console.log): Promise<RapportATS> {
  const rapport: RapportATS = {
    entreprises: COMPANIES.length,
    offresLues: 0,
    creees: 0,
    doublons: 0,
    horsZone: 0,
    erreurs: 0,
    details: [],
  };

  log(`Traitement de ${COMPANIES.length} entreprises (${PARALLEL_COMPANIES} en parallèle, ${PARALLEL_JOBS} jobs concurrents)...`);

  await parallel(COMPANIES, PARALLEL_COMPANIES, (company) =>
    traiterEntreprise(company, rapport, log)
  );

  return rapport;
}

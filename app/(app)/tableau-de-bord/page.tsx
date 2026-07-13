import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { TableauBordClient } from "@/components/tableau/TableauBordClient";

// ─────────────────────────── Helpers ───────────────────────────

function joursRestants(date: Date | null): number | null {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

function norm(s: unknown): string {
  // Retire les accents (plage des diacritiques combinants U+0300–U+036F)
  return typeof s === "string" ? s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : "";
}

function parseJSON<T>(s: string | null | undefined, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback; }
  catch { return fallback; }
}

function jsonLen(s: string | null | undefined): number {
  const arr = parseJSON<unknown[]>(s, []);
  return Array.isArray(arr) ? arr.length : 0;
}

type Piece = { nom: string; obligatoire?: boolean };

const TYPE_KEYWORDS: Record<string, string[]> = {
  DIPLOME: ["diplome", "attestation", "licence", "master", "baccalaureat", "bac", "doctorat", "certificat de scolarite"],
  RELEVE_NOTES: ["releve", "note", "bulletin", "transcript", "resultat"],
  ACTE_NAISSANCE: ["naissance", "acte de naissance", "extrait de naissance"],
  PIECE_IDENTITE: ["identite", "passeport", "cni", "carte nationale", "carte d'identite"],
  JUSTIFICATIF_LANGUE: ["langue", "delf", "dalf", "ielts", "toefl", "tcf", "anglais", "francais", "certification de langue"],
  LETTRE_RECO: ["recommandation", "reference", "reco"],
};
const GENERE_KEYWORDS = ["cv", "curriculum", "lettre de motivation", "lettre motivation", "motivation"];

function calculerConformite(pieces: Piece[], typesPresents: Set<string>, dossierGenere: boolean) {
  if (!pieces.length) return { total: 0, couvertes: 0, pct: 100, manquantes: [] as string[] };
  let couvertes = 0;
  const manquantes: string[] = [];
  for (const p of pieces) {
    const n = norm(p.nom ?? "");
    if (GENERE_KEYWORDS.some((k) => n.includes(k))) {
      if (dossierGenere) couvertes++; else manquantes.push(p.nom);
      continue;
    }
    let matched = false;
    for (const [type, kws] of Object.entries(TYPE_KEYWORDS)) {
      if (kws.some((k) => n.includes(k)) && typesPresents.has(type)) { matched = true; break; }
    }
    if (matched) couvertes++; else manquantes.push(p.nom);
  }
  return { total: pieces.length, couvertes, pct: Math.round((couvertes / pieces.length) * 100), manquantes };
}

function calculerProfilPct(profil: {
  bio: string | null; objectifs: string | null; tonSouhaite: string | null;
  formations: string; experiences: string; competences: string; langues: string;
} | null): number {
  if (!profil) return 0;
  const champs = [
    !!profil.bio?.trim(),
    !!profil.objectifs?.trim(),
    !!profil.tonSouhaite?.trim(),
    jsonLen(profil.formations) > 0,
    jsonLen(profil.experiences) > 0,
    jsonLen(profil.competences) > 0,
    jsonLen(profil.langues) > 0,
  ];
  return Math.round((champs.filter(Boolean).length / champs.length) * 100);
}

// ─────────────────────────── Page ───────────────────────────

export default async function TableauDeBord() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;
  const mois = new Date().toISOString().slice(0, 10);

  const [profil, user, interactions, allInteractions, dossiers, documents, quota, suggestions] = await Promise.all([
    prisma.profil.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, plan: true, createdAt: true } }),
    prisma.interaction.findMany({
      where: { userId, decision: "interesse" },
      include: { opportunite: { select: { id: true, intitule: true, organisme: true, dateLimite: true, piecesExigees: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.interaction.findMany({
      where: { userId },
      select: { decision: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.dossier.findMany({
      where: { userId },
      include: {
        opportunite: { select: { id: true, intitule: true, organisme: true, dateLimite: true, piecesExigees: true } },
        docsGeneres: { select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.document.findMany({ where: { userId }, select: { type: true } }),
    prisma.quotaUsage.findUnique({ where: { userId_mois: { userId, mois } } }),
    prisma.opportunite.findMany({
      where: { type: "BOURSE", actif: true, statut: "publiee", interactions: { none: { userId } } },
      orderBy: [{ dateLimite: "asc" }, { createdAt: "desc" }],
      take: 4,
      select: { id: true, intitule: true, organisme: true, dateLimite: true },
    }),
  ]);

  const role = (session.user as { role?: string }).role;

  const quotaMax = parseInt(process.env.QUOTA_GRATUIT_JOURNALIER ?? "3") || 3;
  const estGratuit = user?.plan === "gratuit" || user?.plan === "GRATUIT";
  const generationsUtilisees = quota?.generationsUtilisees ?? 0;
  const quotaRestant = estGratuit ? Math.max(0, quotaMax - generationsUtilisees) : null;
  const profilPct = calculerProfilPct(profil);
  const nbDocuments = documents.length;
  const typesPresents = new Set(documents.map((d) => d.type));
  const prenom = user?.email?.split("@")[0] ?? "vous";

  const dossierParOpp = new Map(dossiers.map((d) => [d.opportuniteId, d]));
  const oppsMap = new Map<string, { id: string; intitule: string; organisme: string; dateLimite: Date | null; piecesExigees: string }>();
  for (const it of interactions) oppsMap.set(it.opportunite.id, it.opportunite);
  for (const d of dossiers) if (!oppsMap.has(d.opportunite.id)) oppsMap.set(d.opportunite.id, d.opportunite);

  type Retenue = {
    opp: { id: string; intitule: string; organisme: string; dateLimite: Date | null };
    dossierId: string | null;
    statut: "a_preparer" | "genere" | "soumis" | "utilise";
    jours: number | null;
    conf: ReturnType<typeof calculerConformite>;
  };

  const retenues: Retenue[] = [...oppsMap.values()].map((opp) => {
    const d = dossierParOpp.get(opp.id);
    const statut: Retenue["statut"] = d?.statut === "utilise" ? "utilise" : d?.statut === "soumis" ? "soumis" : d ? "genere" : "a_preparer";
    const dossierGenere = statut === "genere" || statut === "soumis";
    const pieces = parseJSON<Piece[]>(opp.piecesExigees, []);
    return {
      opp,
      dossierId: d?.id ?? null,
      statut,
      jours: joursRestants(opp.dateLimite),
      conf: calculerConformite(pieces, typesPresents, dossierGenere),
    };
  });

  retenues.sort((a, b) => (a.jours ?? 9999) - (b.jours ?? 9999));

  const dossiersEnCours = retenues.filter((r) => r.statut !== "soumis" && r.statut !== "utilise").length;
  const prochaineDeadline = retenues.filter((r) => r.jours !== null && r.jours >= 0).sort((a, b) => a.jours! - b.jours!)[0]?.jours ?? null;
  const prochaineEcheance = retenues.find((r) => r.jours !== null && r.jours >= 0) ?? null;

  // ── Alertes (triées par priorité) ──
  type Alerte = { cle: string; prio: number; couleur: "rouge" | "ambre" | "violet"; titre: string; sous: string; href: string; tag?: string };
  const alertes: Alerte[] = [];
  for (const r of retenues) {
    if (r.jours !== null && r.jours >= 0 && r.jours <= 7) {
      alertes.push({ cle: `dl-${r.opp.id}`, prio: r.jours, couleur: r.jours <= 2 ? "rouge" : "ambre", titre: r.opp.intitule, sous: r.opp.organisme, href: r.dossierId ? `/dossiers/${r.dossierId}` : `/opportunites/${r.opp.id}`, tag: r.jours === 0 ? "Aujourd'hui" : `J-${r.jours}` });
    }
  }
  if (estGratuit && quotaRestant === 0) {
    alertes.push({ cle: "quota-0", prio: 1.5, couleur: "rouge", titre: "Quota épuisé", sous: "Rechargez pour générer de nouveaux dossiers", href: "/compte", tag: "0 restante" });
  }
  for (const r of retenues) {
    if (r.conf.total > 0 && r.conf.pct < 100) {
      alertes.push({ cle: `inc-${r.opp.id}`, prio: 10 + (r.jours ?? 999) / 1000, couleur: "ambre", titre: `${r.opp.intitule} — pièce manquante`, sous: `${r.conf.manquantes.slice(0, 2).join(", ")}${r.conf.manquantes.length > 2 ? "…" : ""}`, href: "/coffre-fort", tag: `${r.conf.couvertes}/${r.conf.total}` });
    }
  }
  if (estGratuit && quotaRestant !== null && quotaRestant > 0 && quotaRestant <= 1) {
    alertes.push({ cle: "quota-bas", prio: 20, couleur: "ambre", titre: "Quota bientôt épuisé", sous: `${quotaRestant} génération restante ce mois`, href: "/compte", tag: `${quotaRestant} restante` });
  }
  if (profilPct < 100) {
    alertes.push({ cle: "profil", prio: 30, couleur: "violet", titre: "Complétez votre profil", sous: `Profil rempli à ${profilPct} % — un profil complet améliore vos dossiers`, href: "/profil", tag: `${profilPct} %` });
  }
  if (nbDocuments === 0) {
    alertes.push({ cle: "coffre", prio: 31, couleur: "violet", titre: "Ajoutez vos pièces", sous: "Déposez vos diplômes et justificatifs dans le coffre-fort", href: "/coffre-fort" });
  }
  alertes.sort((a, b) => a.prio - b.prio);

  // ── Données sérialisables pour le composant client ──
  const stats = [
    { key: "dossiers", label: "Dossiers en cours", valeur: String(dossiersEnCours), sous: dossiersEnCours > 0 ? `${retenues.length} opportunité${retenues.length > 1 ? "s" : ""} retenue${retenues.length > 1 ? "s" : ""}` : "Commencez à swiper", href: "/candidatures" },
    { key: "deadline", label: "Prochaine deadline", valeur: prochaineDeadline === null ? "—" : prochaineDeadline === 0 ? "Auj." : `J-${prochaineDeadline}`, sous: prochaineEcheance?.opp.organisme ?? "Aucune échéance", href: "/candidatures" },
    { key: "quota", label: estGratuit ? "Quota restant" : "Abonnement", valeur: estGratuit ? `${quotaRestant}/${quotaMax}` : "∞", sous: estGratuit ? "générations ce mois" : "Plan payant actif", href: "/compte" },
    { key: "profil", label: "Profil complété", valeur: `${profilPct} %`, sous: profilPct === 100 ? "Profil complet" : "À finaliser", href: "/profil" },
  ];

  const retenuesData = retenues.slice(0, 8).map((r) => ({
    id: r.opp.id,
    intitule: r.opp.intitule,
    organisme: r.opp.organisme,
    statut: r.statut,
    jours: r.jours,
    confTotal: r.conf.total,
    confCouvertes: r.conf.couvertes,
    confPct: r.conf.pct,
    href: r.dossierId ? `/dossiers/${r.dossierId}` : `/opportunites/${r.opp.id}`,
  }));

  const echeanceData = prochaineEcheance
    ? {
        intitule: prochaineEcheance.opp.intitule,
        organisme: prochaineEcheance.opp.organisme,
        jours: prochaineEcheance.jours ?? 0,
        statut: prochaineEcheance.statut,
        href: prochaineEcheance.dossierId ? `/dossiers/${prochaineEcheance.dossierId}` : `/opportunites/${prochaineEcheance.opp.id}`,
      }
    : null;

  const suggestionsData = suggestions.map((s) => ({ id: s.id, intitule: s.intitule, organisme: s.organisme, jours: joursRestants(s.dateLimite) }));

  const totalVues = allInteractions.length;
  const totalInteresse = allInteractions.filter((i) => i.decision === "interesse").length;
  const totalIgnore = allInteractions.filter((i) => i.decision === "ignore").length;
  const totalDossiers = dossiers.length;

  const activite = {
    totalVues,
    totalInteresse,
    totalIgnore,
    totalDossiers,
    totalDocuments: nbDocuments,
    membreDepuis: user?.createdAt?.toISOString() ?? new Date().toISOString(),
  };

  return (
    <>
      <EnteteApp titre="Tableau de bord" />
      <main style={{ flex: 1, padding: "24px clamp(16px,3vw,30px) 56px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>

        {/* En-tête : titre + action */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
          <div>
            <h1 style={{ fontSize: "clamp(1.6rem,3vw,2rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
              Bonjour, {prenom}
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: "0.95rem", marginTop: 4 }}>
              Vos candidatures, vos échéances et vos documents en un coup d&apos;œil.
            </p>
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <Link href="/opportunites" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 18px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 6px 20px rgba(124,58,237,0.3)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Parcourir les bourses
            </Link>
          </div>
        </div>

        <TableauBordClient
          stats={stats}
          alertes={alertes}
          retenues={retenuesData}
          prochaineEcheance={echeanceData}
          suggestions={suggestionsData}
          profilPct={profilPct}
          quota={{ estGratuit, restant: quotaRestant, max: quotaMax, utilisees: generationsUtilisees }}
          activite={activite}
        />
      </main>
    </>
  );
}

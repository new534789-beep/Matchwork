import { Suspense } from "react";
import { sessionCourante, getUtilisateur } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { TableauBordClient } from "@/components/tableau/TableauBordClient";
import { getProfilActif } from "@/lib/profil/actif";
import { SqueletteActivite, SqueletteDecouvrir } from "@/components/chargement/Squelette";
import PanneauActivite from "./PanneauActivite";
import PanneauDecouvrir from "./PanneauDecouvrir";
import { calculerConformite, calculerProfilPct, joursRestants, parseJSON, type Piece } from "@/lib/tableau-de-bord/calculs";


// ─────────────────────────── Page ───────────────────────────

export default async function TableauDeBord() {
  const session = await sessionCourante();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;
  const mois = new Date().toISOString().slice(0, 10);

  const [profil, user, interactions, dossiers, documentsTypes, quota, nbDocuments] = await Promise.all([
    getProfilActif(userId),
    getUtilisateur(userId),
    prisma.interaction.findMany({
      where: { userId, decision: "interesse" },
      include: { opportunite: { select: { id: true, intitule: true, organisme: true, dateLimite: true, piecesExigees: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.dossier.findMany({
      where: { userId },
      include: { opportunite: { select: { id: true, intitule: true, organisme: true, dateLimite: true, piecesExigees: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.document.findMany({ where: { userId }, select: { type: true }, distinct: ["type"] }),
    prisma.quotaUsage.findUnique({ where: { userId_mois: { userId, mois } } }),
    prisma.document.count({ where: { userId } }),
  ]);

  const quotaMax = parseInt(process.env.QUOTA_GRATUIT_JOURNALIER ?? "3") || 3;
  const estGratuit = user?.plan === "gratuit" || user?.plan === "GRATUIT";
  const generationsUtilisees = quota?.generationsUtilisees ?? 0;
  const quotaRestant = estGratuit ? Math.max(0, quotaMax - generationsUtilisees) : null;
  const profilPct = calculerProfilPct(profil);
  const typesPresents = new Set(documentsTypes.map((d) => d.type));
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
    const statut: Retenue["statut"] = d?.statut === "utilise" || d?.statut === "obtenu" ? "utilise" : d?.statut === "soumis" ? "soumis" : d ? "genere" : "a_preparer";
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

  const planPro = user?.plan === "pro" || user?.plan === "pro_plus";
  const dossiersEnvoyes = dossiers.filter((d) => d.statut === "utilise" || d.statut === "obtenu").length;
  const dossiersObtenus = dossiers.filter((d) => d.statut === "obtenu").length;
  const tauxReussite = dossiersEnvoyes > 0 ? Math.round((dossiersObtenus / dossiersEnvoyes) * 100) : null;

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
    alertes.push({ cle: "quota-bas", prio: 20, couleur: "ambre", titre: "Quota bientôt épuisé", sous: `${quotaRestant} génération restante aujourd'hui`, href: "/compte", tag: `${quotaRestant} restante` });
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
    { key: "quota", label: estGratuit ? "Quota restant" : "Abonnement", valeur: estGratuit ? `${quotaRestant}/${quotaMax}` : "∞", sous: estGratuit ? "générations aujourd'hui" : "Plan payant actif", href: "/compte" },
    { key: "profil", label: "Profil complété", valeur: `${profilPct} %`, sous: profilPct === 100 ? "Profil complet" : "À finaliser", href: "/profil" },
    // Carte en violet plein : c'est une action à découvrir, pas un compteur.
    { key: "orientation", label: "IA Orientation", valeur: "210", sous: "filières classées selon tes notes", href: "/orientation", accent: true },
  ];
  if (planPro) {
    stats.push({
      key: "reussite",
      label: "Taux de réussite",
      valeur: tauxReussite === null ? "—" : `${tauxReussite} %`,
      sous: dossiersEnvoyes > 0 ? `${dossiersObtenus}/${dossiersEnvoyes} candidatures obtenues` : "Aucune candidature envoyée",
      href: "/candidatures",
    });
  }

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
          profilPct={profilPct}
          quota={{ estGratuit, restant: quotaRestant, max: quotaMax, utilisees: generationsUtilisees }}
          activiteContenu={
            <Suspense fallback={<SqueletteActivite />}>
              <PanneauActivite userId={userId} />
            </Suspense>
          }
          decouvrirContenu={
            <Suspense fallback={<SqueletteDecouvrir />}>
              <PanneauDecouvrir userId={userId} />
            </Suspense>
          }
        />
      </main>
    </>
  );
}

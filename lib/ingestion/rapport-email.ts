/**
 * Envoi d'un rapport de synthèse par e-mail après chaque run cron.
 * Utilise Resend (même clé que l'envoi de dossiers).
 */

export interface RapportBot {
  nom: string;
  creees: number;
  doublons: number;
  erreurs: number;
  sourcesEnPanne?: string[];
  dureeMs?: number;
}

export interface RapportCron {
  jour: number;
  tache: string;
  expirees: number;
  bots: RapportBot[];
}

function ligneBot(b: RapportBot): string {
  const panne = b.sourcesEnPanne?.length
    ? `<br>&nbsp;&nbsp;Sources en panne : ${b.sourcesEnPanne.join(", ")}`
    : "";
  const duree = b.dureeMs ? ` (${(b.dureeMs / 1000).toFixed(1)}s)` : "";
  return `<tr>
    <td style="padding:4px 8px">${b.nom}${duree}</td>
    <td style="padding:4px 8px;text-align:right">${b.creees}</td>
    <td style="padding:4px 8px;text-align:right">${b.doublons}</td>
    <td style="padding:4px 8px;text-align:right;color:${b.erreurs ? "#ef4444" : "inherit"}">${b.erreurs}</td>
  </tr>${panne ? `<tr><td colspan="4" style="padding:0 8px;font-size:12px;color:#ef4444">${panne}</td></tr>` : ""}`;
}

export async function envoyerRapportCron(rapport: RapportCron): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_EXPEDITEUR || "onboarding@resend.dev";
  const to = process.env.RAPPORT_EMAIL || "aimoneyhello@gmail.com";

  if (!apiKey) return false;

  const totalCreees = rapport.bots.reduce((s, b) => s + b.creees, 0);
  const totalErreurs = rapport.bots.reduce((s, b) => s + b.erreurs, 0);
  const pannes = rapport.bots.flatMap((b) => b.sourcesEnPanne ?? []);

  const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const sujet = `Matchwork ${jours[rapport.jour]} — ${totalCreees} nouvelles, ${rapport.expirees} expirées${totalErreurs ? `, ${totalErreurs} erreurs` : ""}`;

  const html = `
<div style="font-family:sans-serif;font-size:14px;line-height:1.6;max-width:600px">
  <h2 style="color:#8b5cf6;margin-bottom:4px">Rapport Matchwork</h2>
  <p style="margin:0 0 12px;color:#888">${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — Tâche : ${rapport.tache}</p>

  <table style="border-collapse:collapse;width:100%;font-size:13px">
    <thead><tr style="background:#f5f3ff">
      <th style="padding:6px 8px;text-align:left">Bot</th>
      <th style="padding:6px 8px;text-align:right">Nouvelles</th>
      <th style="padding:6px 8px;text-align:right">Doublons</th>
      <th style="padding:6px 8px;text-align:right">Erreurs</th>
    </tr></thead>
    <tbody>${rapport.bots.map(ligneBot).join("")}</tbody>
    <tfoot><tr style="font-weight:bold;border-top:2px solid #8b5cf6">
      <td style="padding:6px 8px">Total</td>
      <td style="padding:6px 8px;text-align:right">${totalCreees}</td>
      <td style="padding:6px 8px;text-align:right">${rapport.bots.reduce((s, b) => s + b.doublons, 0)}</td>
      <td style="padding:6px 8px;text-align:right">${totalErreurs}</td>
    </tr></tfoot>
  </table>

  <p style="margin:12px 0 4px"><strong>Expirées retirées :</strong> ${rapport.expirees}</p>
  ${pannes.length ? `<p style="color:#ef4444"><strong>Sources en panne :</strong> ${pannes.join(", ")}</p>` : ""}
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: sujet, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

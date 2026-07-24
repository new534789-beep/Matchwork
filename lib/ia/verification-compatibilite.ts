import { hasMistralKey, getMistralClient, MODELS } from "@/lib/ia/mistral";
import { SYSTEM_COMPATIBILITE, buildCompatibiliteMessage } from "@/lib/ia/prompts/compatibilite";

export type ResultatCompatibilite = { compatible: boolean; raison?: string };

type ProfilInput = { formations: string; experiences: string; competences: string };
type OpportuniteInput = {
  type: string;
  intitule: string;
  organisme: string;
  description: string;
  contenuBrut?: string | null;
  conditions?: string | null;
};

/**
 * Vérifie si le profil du candidat est fondamentalement compatible avec l'offre,
 * avant de créer un dossier — pour éviter de générer un CV/lettre honnête mais
 * hors-sujet (ex. profil génie civil sur une offre de peintre). Volontairement
 * permissif : ne bloque que les décalages évidents (voir prompt).
 *
 * Renvoie null si l'IA est indisponible ou en cas d'erreur — on n'échoue JAMAIS
 * fermé (fail-open) : un souci technique ne doit jamais bloquer une vraie
 * candidature.
 */
export async function verifierCompatibilite(
  profil: ProfilInput,
  opportunite: OpportuniteInput
): Promise<ResultatCompatibilite | null> {
  if (!hasMistralKey()) return null;

  try {
    const client = getMistralClient();
    const result = await client.chat.complete({
      model: MODELS.small,
      messages: [
        { role: "system", content: SYSTEM_COMPATIBILITE },
        { role: "user", content: buildCompatibiliteMessage(profil, opportunite) },
      ],
      responseFormat: { type: "json_object" },
    });
    const raw = ((result.choices?.[0]?.message?.content as string) ?? "").trim();
    const parsed = JSON.parse(raw) as { compatible?: boolean; raison?: string };
    if (typeof parsed.compatible !== "boolean") return null;
    return { compatible: parsed.compatible, raison: parsed.raison };
  } catch {
    return null;
  }
}

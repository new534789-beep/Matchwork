import { etapesDossier, etapeActuelle, type EtapesDossierProps } from "@/lib/dossier-etapes";

const V = "#7c3aed";

export function ProgressionMini(props: EtapesDossierProps) {
  const etapes = etapesDossier(props);
  const { index, etape } = etapeActuelle(etapes);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, minWidth: 96 }}>
      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: etape.statut === "fait" && index === etapes.length - 1 ? "#22c55e" : "var(--text-2)" }}>
        {etape.label}
      </span>
      <div style={{ display: "flex", gap: 3 }}>
        {etapes.map((e, i) => (
          <div
            key={e.label}
            title={e.label}
            style={{
              width: 14, height: 4, borderRadius: 2,
              background: e.statut === "fait" ? V : e.statut === "en_cours" ? "rgba(124,58,237,0.5)" : "var(--border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

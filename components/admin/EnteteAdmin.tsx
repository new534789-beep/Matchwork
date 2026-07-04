export function EnteteAdmin({
  titre,
  sousTitre,
  action,
}: {
  titre: string;
  sousTitre?: string;
  action?: React.ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-30 px-5 sm:px-8 py-4 flex items-center justify-between gap-4"
      style={{
        background: "var(--header-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1 className="text-lg font-bold truncate" style={{ color: "var(--text)" }}>{titre}</h1>
        {sousTitre && <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{sousTitre}</p>}
      </div>
      {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
    </header>
  );
}

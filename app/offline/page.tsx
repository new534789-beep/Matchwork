"use client";

export default function Offline() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)" }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
        <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0122.56 9" />
        <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
        <path d="M8.53 16.11a6 6 0 016.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginTop: 24 }}>Hors connexion</h1>
      <p style={{ color: "var(--text-2)", marginTop: 8, textAlign: "center", maxWidth: 320, fontSize: "0.9rem" }}>
        Vous n&apos;avez pas de connexion internet. Les pages déjà visitées restent disponibles.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 24, padding: "12px 24px", borderRadius: 12,
          background: "#7c3aed", color: "#fff", border: "none",
          fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
        }}
      >
        Réessayer
      </button>
    </main>
  );
}

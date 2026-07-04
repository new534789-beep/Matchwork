"use client";

import { useState } from "react";
import Link from "next/link";

export function NavMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <span style={{ display:"block", width:"22px", height:"2px", background:"#fff", borderRadius:"1px", transition:"transform 0.22s ease, opacity 0.22s ease", transform: open ? "rotate(45deg) translate(2px,3px)" : "none" }} />
        <span style={{ display:"block", width:"22px", height:"2px", background:"#fff", borderRadius:"1px", transition:"opacity 0.22s ease", opacity: open ? 0 : 1 }} />
        <span style={{ display:"block", width:"22px", height:"2px", background:"#fff", borderRadius:"1px", transition:"transform 0.22s ease", transform: open ? "rotate(-45deg) translate(2px,-3px)" : "none" }} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background:"rgba(0,0,0,0.93)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0" }}
          onClick={() => setOpen(false)}
        >
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"28px" }}>
            {["Solutions", "Fonctionnalités", "Tarifs", "À propos"].map(l => (
              <span key={l} style={{ fontSize:"1.5rem", fontWeight:600, color:"rgba(255,255,255,0.72)", cursor:"pointer", letterSpacing:"-0.02em" }}>
                {l}
              </span>
            ))}
            <div style={{ width:"40px", height:"1px", background:"rgba(255,255,255,0.1)", margin:"4px 0" }} />
            <Link
              href="/inscription"
              onClick={() => setOpen(false)}
              style={{ display:"inline-flex", alignItems:"center", padding:"14px 40px", borderRadius:"12px", fontWeight:600, fontSize:"1rem", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", color:"#fff", textDecoration:"none", boxShadow:"0 0 30px rgba(124,58,237,0.4)" }}
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/connexion"
              onClick={() => setOpen(false)}
              style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.38)", textDecoration:"none" }}
            >
              Se connecter
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

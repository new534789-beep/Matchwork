"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export function NavMobile() {
  const [open, setOpen] = useState(false);
  const [monte, setMonte] = useState(false);

  // Le portail ne peut cibler document.body qu'une fois monté côté client.
  useEffect(() => { setMonte(true); }, []);

  return (
    <>
      <button
        className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <span style={{ display:"block", width:"24px", height:"2.5px", background:"#fff", borderRadius:"2px", transition:"transform 0.22s ease, opacity 0.22s ease", transform: open ? "rotate(45deg) translate(2px,3px)" : "none" }} />
        <span style={{ display:"block", width:"24px", height:"2.5px", background:"#fff", borderRadius:"2px", transition:"opacity 0.22s ease", opacity: open ? 0 : 1 }} />
        <span style={{ display:"block", width:"24px", height:"2.5px", background:"#fff", borderRadius:"2px", transition:"transform 0.22s ease", transform: open ? "rotate(-45deg) translate(2px,-3px)" : "none" }} />
      </button>

      {/* Portail vers document.body : un ancêtre de la nav a un backdrop-filter, qui
          crée un containing block et piégerait un position:fixed dans la pilule au
          lieu de couvrir tout l'écran. */}
      {monte && open && createPortal(
        <div
          className="fixed inset-0 z-[100]"
          style={{ background:"#0a0a0a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0" }}
          onClick={() => setOpen(false)}
        >
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"24px" }}>
            {[
              { label: "Comment ça marche", href: "#comment" },
              { label: "Fonctionnalités", href: "#fonctionnalites" },
              { label: "Tarifs", href: "#tarifs" },
              { label: "FAQ", href: "#faq" },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{ fontSize:"1.3rem", fontWeight:600, color:"rgba(255,255,255,0.72)", cursor:"pointer", letterSpacing:"-0.02em", textDecoration:"none" }}
              >
                {item.label}
              </a>
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
              style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.5)", textDecoration:"none" }}
            >
              Se connecter
            </Link>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

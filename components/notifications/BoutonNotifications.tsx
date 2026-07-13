"use client";

import { useState, useEffect } from "react";

export function BoutonNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;

  const sAbonner = async () => {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const json = sub.toJSON();
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (permission === "granted") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 16px", borderRadius: 11,
        background: "rgba(124,58,237,0.08)", color: "#a78bfa",
        fontSize: "0.82rem", fontWeight: 600,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        Notifications activées
      </div>
    );
  }

  if (permission === "denied") return null;

  return (
    <button
      onClick={sAbonner}
      disabled={loading}
      style={{
        padding: "9px 16px", borderRadius: 11, cursor: "pointer",
        background: "rgba(124,58,237,0.1)", color: "#a78bfa",
        border: "1px solid rgba(124,58,237,0.25)",
        fontWeight: 600, fontSize: "0.82rem",
        display: "inline-flex", alignItems: "center", gap: 8,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {loading ? "Activation..." : "Activer les notifications"}
    </button>
  );
}

"use client";

import { useEffect, useRef } from "react";

const HEARTBEAT_MS = 60_000;

export function useSessionTracker() {
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    async function ping(sid?: string | null) {
      try {
        const res = await fetch("/api/session/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sid ? { sessionId: sid } : {}),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.sessionId) sessionIdRef.current = data.sessionId;
        }
      } catch {}
    }

    ping().then(() => {
      interval = setInterval(() => ping(sessionIdRef.current), HEARTBEAT_MS);
    });

    function onVisibilityChange() {
      if (document.visibilityState === "hidden" && sessionIdRef.current) {
        navigator.sendBeacon(
          "/api/session/heartbeat",
          new Blob(
            [JSON.stringify({ sessionId: sessionIdRef.current })],
            { type: "application/json" },
          ),
        );
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (sessionIdRef.current) {
        navigator.sendBeacon(
          "/api/session/heartbeat",
          new Blob(
            [JSON.stringify({ sessionId: sessionIdRef.current })],
            { type: "application/json" },
          ),
        );
      }
    };
  }, []);
}

"use client";

import { useSessionTracker } from "@/hooks/useSessionTracker";

export function SessionTrackerWrapper() {
  useSessionTracker();
  return null;
}

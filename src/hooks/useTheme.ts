"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  // Start with null to avoid server/client mismatch.
  // The inline script in layout.tsx already sets data-theme before first paint,
  // so there is no visible flash — we just need to read the DOM value after mount.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme") as Theme | null;
    const stored = (() => {
      try { return localStorage.getItem("vf-theme") as Theme | null; } catch { return null; }
    })();
    // Reading DOM state set by the FOUC-prevention script — legitimate mount-time sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(attr || stored || "light");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("vf-theme", next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { theme: theme ?? "light", toggleTheme, mounted: theme !== null };
}

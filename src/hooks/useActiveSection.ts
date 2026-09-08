"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Tracks which section (by id) is currently visible in the viewport.
 * Uses IntersectionObserver to update as the user scrolls.
 *
 * @param sectionIds - ordered list of section element ids to observe
 * @returns the id of the currently active section
 */
export function useActiveSection(sectionIds: string[]): string {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find entries that are intersecting, pick the one closest to the top
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActiveSection(visible[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-60px 0px -50% 0px",
      threshold: 0,
    });

    const observer = observerRef.current;

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return activeSection;
}

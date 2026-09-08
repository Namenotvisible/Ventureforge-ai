"use client";

import { useActiveSection } from "@/hooks/useActiveSection";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NAV_ITEMS } from "@/components/layout/Sidebar";

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const activeSection = useActiveSection(SECTION_IDS);

  return (
    <DashboardLayout activeSection={activeSection}>
      {children}
    </DashboardLayout>
  );
}

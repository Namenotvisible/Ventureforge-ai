"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
}

export function DashboardLayout({ children, activeSection }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Desktop sidebar */}
      <Sidebar activeSection={activeSection} />

      {/* Mobile header */}
      <Header activeSection={activeSection} />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="lg:ml-[240px] min-h-screen">
        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-end h-14 px-6 bg-[var(--bg-surface)] border-b border-[var(--vf-border)] sticky top-0 z-20">
          <ThemeToggle />
        </div>

        {/* Page content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}

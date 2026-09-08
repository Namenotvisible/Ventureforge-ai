"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Layers,
  DollarSign,
  BarChart2,
  Target,
  AlertTriangle,
  FileText,
  Zap,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { id: "overview",         label: "Overview",           icon: LayoutDashboard, href: "/dashboard#overview" },
  { id: "market",           label: "Market Analysis",    icon: TrendingUp,      href: "/dashboard#market" },
  { id: "target-customers", label: "Target Customers",   icon: UserCheck,       href: "/dashboard#target-customers" },
  { id: "business-model",   label: "Business Model",     icon: Layers,          href: "/dashboard#business-model" },
  { id: "competitors",      label: "Competitors",        icon: Users,           href: "/dashboard#competitors" },
  { id: "funding",          label: "Funding & Schemes",  icon: DollarSign,      href: "/dashboard#funding" },
  { id: "financials",       label: "Financials",         icon: BarChart2,       href: "/dashboard#financials" },
  { id: "gtm",              label: "Go-To-Market",       icon: Target,          href: "/dashboard#gtm" },
  { id: "risks",            label: "Risk Analysis",      icon: AlertTriangle,   href: "/dashboard#risks" },
  { id: "blueprint",        label: "Final Blueprint",    icon: FileText,        href: "/dashboard#blueprint" },
] as const;

interface SidebarNavProps {
  activeSection?: string;
  onNavClick?: () => void;
}

export function SidebarNav({ activeSection, onNavClick }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
        const isActive = activeSection === id;
        return (
          <a
            key={id}
            href={href}
            onClick={onNavClick}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
              "transition-all duration-150",
              "border-l-2",
              isActive
                ? [
                    "border-[var(--vf-accent)] bg-[var(--vf-accent-subtle)]",
                    "text-[var(--vf-accent-text)]",
                  ]
                : [
                    "border-transparent text-[var(--text-secondary)]",
                    "hover:border-[var(--vf-border)] hover:bg-[var(--bg-subtle)]",
                    "hover:text-[var(--text-primary)]",
                  ]
            )}
          >
            <Icon
              size={15}
              strokeWidth={isActive ? 2.5 : 2}
              className={cn(
                "shrink-0 transition-colors duration-150",
                isActive
                  ? "text-[var(--vf-accent)]"
                  : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
              )}
            />
            <span className="truncate">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  activeSection?: string;
}

export function Sidebar({ activeSection }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col",
        "fixed left-0 top-0 bottom-0 w-[240px]",
        "bg-[var(--bg-surface)] border-r border-[var(--vf-border)]",
        "z-30"
      )}
    >
      {/* Brand — clickable back to home */}
      <Link
        href="/"
        className="flex items-center gap-2.5 px-6 py-5 border-b border-[var(--vf-border-subtle)] hover:bg-[var(--bg-subtle)] transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--vf-accent)] text-white">
          <Zap size={16} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
          VentureForge AI
        </span>
      </Link>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3">
        <SidebarNav activeSection={activeSection} />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--vf-border-subtle)]">
        <p className="text-xs text-[var(--text-muted)]">Startup Blueprint Generator</p>
      </div>
    </aside>
  );
}

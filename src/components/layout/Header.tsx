"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Zap } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarNav } from "./Sidebar";

interface HeaderProps {
  activeSection?: string;
}

export function Header({ activeSection }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={[
        "sticky top-0 z-40 flex h-14 items-center gap-3 px-4",
        "bg-[var(--bg-surface)]/90 backdrop-blur-sm",
        "border-b border-[var(--vf-border)]",
        "lg:hidden",
      ].join(" ")}
    >
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button
              aria-label="Open navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
            />
          }
        >
          <Menu size={20} />
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0 bg-[var(--bg-surface)] border-[var(--vf-border)]">
          {/* Brand — links back to home */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
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
          <div className="py-4">
            <SidebarNav
              activeSection={activeSection}
              onNavClick={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Brand — mobile center */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--vf-accent)] text-white">
          <Zap size={14} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">VentureForge AI</span>
      </Link>

      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}

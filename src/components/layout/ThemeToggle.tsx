"use client";

import { Sun, Moon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full",
        "text-[var(--text-secondary)] transition-colors duration-150",
        "hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vf-accent)] focus-visible:ring-offset-2",
        "focus-visible:ring-offset-[var(--bg-base)]",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!mounted ? null : theme === "light" ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="absolute flex items-center justify-center"
          >
            <Sun size={17} strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="absolute flex items-center justify-center"
          >
            <Moon size={17} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Loader2, AlertCircle,
  Lightbulb, Building2, Users, MapPin, Wallet, Hash,
} from "lucide-react";
import { motion } from "framer-motion";
import { useBlueprintStore } from "@/store/blueprintStore";
import type { GenerateRequest, BlueprintOverview } from "@/app/api/generate/route";

const INDUSTRIES = [
  "Agritech", "Edtech", "Fintech", "Healthtech", "Logistics",
  "E-commerce", "SaaS / B2B Software", "Clean Energy", "Food & Beverage",
  "Travel & Hospitality", "Media & Entertainment", "Other",
];

const STAGES = ["Idea", "Pre-seed", "Seed"];

const BUDGETS = [
  "Under ₹5 lakhs", "₹5–10 lakhs", "₹10–50 lakhs",
  "₹50 lakhs – ₹1 crore", "Over ₹1 crore",
];

// ── Shared input class ───────────────────────────────────────────────────────
const FIELD =
  "rounded-lg border border-[var(--vf-border)] bg-[var(--bg-base)] px-3 py-2.5 " +
  "text-sm text-[var(--text-primary)] w-full " +
  "placeholder:text-[var(--text-muted)] " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--vf-accent)]/60 focus:border-[var(--vf-accent)] " +
  "hover:border-[var(--vf-accent)]/35 " +
  "transition-all duration-150";

// ── Field group with icon label ──────────────────────────────────────────────
interface FieldGroupProps {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
}
function FieldGroup({ label, icon: Icon, required, children }: FieldGroupProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest mb-2">
        <Icon size={12} className="text-[var(--vf-accent)] shrink-0" />
        {label}
        {required && <span className="text-[var(--vf-accent)]">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Pill segmented control ───────────────────────────────────────────────────
interface PillSelectProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}
function PillSelect({ options, value, onChange, disabled }: PillSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(active ? "" : opt)}
            className={[
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vf-accent)]",
              active
                ? "border-[var(--vf-accent)] bg-[var(--vf-accent)] text-white shadow-[0_0_0_3px_var(--vf-accent-subtle)]"
                : "border-[var(--vf-border)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--vf-accent)]/40 hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────────────────
export function IntakeForm() {
  const router = useRouter();
  const { setBlueprint, setGenerating, setError, isGenerating } = useBlueprintStore();

  const [idea, setIdea] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [location, setLocation] = useState("India");
  const [stage, setStage] = useState("");
  const [budget, setBudget] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isGenerating) return; // duplicate-submit guard
    if (!idea.trim()) {
      setLocalError("Please describe your startup idea.");
      return;
    }

    setLocalError(null);
    setGenerating(true);

    const payload: GenerateRequest = {
      idea: idea.trim(),
      industry: industry || undefined,
      targetCustomer: targetCustomer || undefined,
      location: location || undefined,
      stage: stage || undefined,
      budget: budget || undefined,
      teamSize: teamSize ? parseInt(teamSize, 10) : undefined,
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as BlueprintOverview & { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? `Generation failed (${res.status}). Please try again.`);
      }

      setBlueprint(data, payload);
      router.push("/dashboard");
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      // Show a clean error — strip raw technical details that confuse users
      const friendly = raw.startsWith("AI generation failed:")
        ? "The AI model couldn't generate a response. Please try again in a moment."
        : raw.length > 120
          ? raw.slice(0, 120) + "…"
          : raw;
      setError(friendly);
      setLocalError(friendly);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* ── Idea ── */}
      <FieldGroup label="Startup Idea" icon={Lightbulb} required>
        <textarea
          className={`${FIELD} min-h-[100px] resize-y`}
          placeholder="Describe your startup idea in 2–3 sentences. What problem does it solve and for whom?"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={isGenerating}
          required
        />
      </FieldGroup>

      {/* ── Industry ── */}
      <FieldGroup label="Industry" icon={Building2}>
        <select
          className={FIELD}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          disabled={isGenerating}
        >
          <option value="">Select industry…</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </FieldGroup>

      {/* ── Startup Stage — pill select ── */}
      <FieldGroup label="Startup Stage" icon={MapPin}>
        <PillSelect options={STAGES} value={stage} onChange={setStage} disabled={isGenerating} />
      </FieldGroup>

      {/* ── Target Customer + Location ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Target Customer" icon={Users}>
          <input
            type="text"
            className={FIELD}
            placeholder="e.g. Small farmers in rural India"
            value={targetCustomer}
            onChange={(e) => setTargetCustomer(e.target.value)}
            disabled={isGenerating}
          />
        </FieldGroup>
        <FieldGroup label="Location" icon={MapPin}>
          <input
            type="text"
            className={FIELD}
            placeholder="e.g. India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isGenerating}
          />
        </FieldGroup>
      </div>

      {/* ── Budget — pill select ── */}
      <FieldGroup label="Approximate Budget" icon={Wallet}>
        <PillSelect options={BUDGETS} value={budget} onChange={setBudget} disabled={isGenerating} />
      </FieldGroup>

      {/* ── Team Size ── */}
      <FieldGroup label="Team Size" icon={Hash}>
        <div className="relative max-w-[140px]">
          <input
            type="number"
            min={1}
            max={999}
            className={FIELD}
            placeholder="e.g. 3"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            disabled={isGenerating}
          />
        </div>
      </FieldGroup>

      {/* ── Error ── */}
      {localError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{localError}</span>
        </motion.div>
      )}

      {/* ── Submit ── */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isGenerating || !idea.trim()}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[var(--vf-accent)] px-7 py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[var(--vf-accent-hover)] hover:shadow-[0_0_0_4px_var(--vf-accent-subtle)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating blueprint…
            </>
          ) : (
            <>
              Generate Blueprint
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}

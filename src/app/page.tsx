"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, TrendingUp, FileText, DollarSign, BarChart2, Target,
  ArrowRight, CheckCircle2, ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { IntakeForm } from "@/components/intake/IntakeForm";

// ── Feature list ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: TrendingUp,  title: "Market Analysis",    description: "Competitor landscape, differentiation opportunities, and market sizing — grounded in a curated Indian startup knowledge base." },
  { icon: FileText,    title: "Business Blueprint",  description: "Business model, revenue strategy, and a comprehensive final report — generated in one AI pass." },
  { icon: DollarSign,  title: "Funding Discovery",   description: "Matching government schemes (DPIIT, SIDBI, MUDRA), grants, and VC funding paths for your stage." },
  { icon: BarChart2,   title: "Financial Planning",  description: "Burn rate, runway, and break-even estimates from your team size and budget — no spreadsheet required." },
  { icon: Target,      title: "Go-To-Market",        description: "A staged GTM plan — Validate, Pilot, Launch, Scale — adapted to your industry and current stage." },
];

// ── How it works steps ───────────────────────────────────────────────────────
const HOW_STEPS = [
  { n: "01", title: "Describe your idea",   body: "Enter your startup concept, industry, target customer, stage, team size, and budget." },
  { n: "02", title: "AI + RAG Analysis",    body: "IBM Granite 4 analyses your idea alongside a curated Indian startup knowledge base." },
  { n: "03", title: "Receive your blueprint", body: "Get a structured, actionable startup blueprint — market analysis, GTM, financials, funding, and more." },
];

// ── Example use cases ────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    industry: "Agritech",
    idea: "A crop advisory platform for smallholder farmers using satellite imagery and local crop data.",
    stage: "Idea",
    outcome: "Market analysis, RKVY/PM-KISAN grant matching, GTM via Krishi Vigyan Kendras.",
  },
  {
    industry: "Edtech",
    idea: "Vernacular language coding bootcamps for Tier 2/3 city students, mobile-first.",
    stage: "Seed",
    outcome: "Competitor benchmarking, DIKSHA integration pathway, financial runway for 18 months.",
  },
  {
    industry: "Fintech",
    idea: "Micro-insurance bundled into UPI payment flows for gig-economy workers.",
    stage: "Pre-seed",
    outcome: "IRDAI sandbox guidance, angel funding shortlist, B2B2C GTM strategy.",
  },
  {
    industry: "SaaS / B2B",
    idea: "AI-powered procurement automation for mid-market Indian manufacturers.",
    stage: "Seed",
    outcome: "TAM estimate, Series A readiness checklist, channel partner GTM model.",
  },
];

const INDUSTRY_COLOURS: Record<string, string> = {
  Agritech: "text-emerald-600 dark:text-emerald-400",
  Edtech: "text-blue-600 dark:text-blue-400",
  Fintech: "text-violet-600 dark:text-violet-400",
  "SaaS / B2B": "text-amber-600 dark:text-amber-400",
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: "easeOut", delay },
});

export default function HomePage() {
  const formRef = useRef<HTMLDivElement>(null);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col relative overflow-x-hidden">

      {/* ── Ambient background orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-[var(--vf-accent)]/[0.06] blur-[90px]" />
        <div className="absolute top-1/3 -right-48 h-[440px] w-[440px] rounded-full bg-[var(--vf-accent)]/[0.04] blur-[80px]" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-[var(--vf-accent)]/[0.03] blur-[70px]" />
      </div>

      {/* ── Top nav ── */}
      <header className="sticky top-0 z-40 bg-[var(--bg-surface)]/85 backdrop-blur-md border-b border-[var(--vf-border)]">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--vf-accent)] text-white shadow-[0_2px_6px_rgba(79,70,229,0.35)] group-hover:bg-[var(--vf-accent-hover)] transition-colors duration-150">
              <Zap size={16} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">VentureForge AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToForm}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[var(--vf-border)] bg-[var(--bg-surface)] px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-all duration-150"
            >
              Try it
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 flex-shrink-0 px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-[var(--vf-border)] bg-[var(--bg-surface)]/80 px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] mb-8 shadow-[var(--shadow-sm)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--vf-accent)]" />
            Powered by IBM Granite 4 · watsonx.ai · RAG
          </motion.div>

          <motion.h1 {...fade(0.05)} className="text-display text-[var(--text-primary)] mb-5">
            Your startup idea,{" "}
            <span className="text-[var(--vf-accent)]">blueprinted in minutes</span>
          </motion.h1>

          <motion.p {...fade(0.1)} className="text-[18px] text-[var(--text-secondary)] leading-relaxed mb-10 max-w-2xl mx-auto">
            VentureForge AI generates a complete, investor-ready startup blueprint — market analysis, business model, financial planning, funding discovery, and GTM strategy — powered by IBM Granite and a curated Indian startup knowledge base.
          </motion.p>

          <motion.div {...fade(0.15)} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--vf-accent)] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:bg-[var(--vf-accent-hover)] hover:shadow-[0_4px_18px_rgba(79,70,229,0.45)] active:scale-[0.98] transition-all duration-150"
            >
              Try VentureForge AI
              <ArrowRight size={16} />
            </button>
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--vf-accent)] transition-colors duration-150"
            >
              See an example
              <ChevronDown size={15} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 border-t border-[var(--vf-border)] bg-[var(--bg-subtle)] px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.p {...fade()} className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] text-center mb-2">
            How it works
          </motion.p>
          <motion.h2 {...fade(0.05)} className="text-[22px] font-bold text-[var(--text-primary)] text-center mb-10 tracking-tight">
            From idea to blueprint in 3 steps
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_STEPS.map(({ n, title, body }, i) => (
              <motion.div key={n} {...fade(i * 0.07)} className="relative flex flex-col items-start">
                {/* Connector line */}
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-[calc(100%+0.75rem)] right-0 h-px bg-[var(--vf-border)] -translate-y-px w-[calc(100%+1.5rem)]" style={{ width: "calc(1.5rem + 1px)", left: "calc(100% + 0.25rem)" }} />
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--vf-accent-subtle)] text-[13px] font-bold text-[var(--vf-accent)]">{n}</span>
                </div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="relative z-10 px-4 sm:px-6 py-16 bg-[var(--bg-base)]">
        <div className="mx-auto max-w-5xl">
          <motion.p {...fade()} className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] text-center mb-2">
            What you get
          </motion.p>
          <motion.h2 {...fade(0.05)} className="text-[22px] font-bold text-[var(--text-primary)] text-center mb-10 tracking-tight">
            A complete startup analysis
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                {...fade(i * 0.05)}
                className="group rounded-xl border border-[var(--vf-border)] bg-[var(--bg-surface)] p-5 transition-all duration-200 hover:border-[var(--vf-accent)]/40 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--vf-accent-subtle)] transition-colors duration-200 group-hover:bg-[var(--vf-accent)]">
                  <Icon size={19} className="text-[var(--vf-accent)] transition-colors duration-200 group-hover:text-white" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example use cases ── */}
      <section className="relative z-10 border-t border-[var(--vf-border)] bg-[var(--bg-subtle)] px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.p {...fade()} className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] text-center mb-2">
            Examples
          </motion.p>
          <motion.h2 {...fade(0.05)} className="text-[22px] font-bold text-[var(--text-primary)] text-center mb-10 tracking-tight">
            Built for every sector
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {EXAMPLES.map(({ industry, idea, stage, outcome }, i) => (
              <motion.div
                key={industry}
                {...fade(i * 0.07)}
                className="rounded-xl border border-[var(--vf-border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--vf-accent)]/30 transition-colors duration-200"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${INDUSTRY_COLOURS[industry] ?? "text-[var(--vf-accent)]"}`}>{industry}</span>
                  <span className="text-[10px] font-medium rounded-full border border-[var(--vf-border)] px-2 py-0.5 text-[var(--text-muted)]">{stage}</span>
                </div>
                <p className="text-sm text-[var(--text-primary)] font-medium leading-snug mb-3">{idea}</p>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-[var(--vf-accent)]" />
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{outcome}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intake form (anchor target) ── */}
      <section ref={formRef} id="generate" className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 bg-[var(--bg-base)]">
        <div className="mx-auto max-w-2xl">
          <motion.div {...fade()}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] text-center mb-2">Get started</p>
            <h2 className="text-[22px] font-bold text-[var(--text-primary)] text-center mb-2 tracking-tight">
              Generate your blueprint
            </h2>
            <p className="text-sm text-[var(--text-muted)] text-center mb-8">
              Fill in your idea — every field beyond the idea is optional, but improves output quality.
            </p>
          </motion.div>

          {/* Premium form card */}
          <motion.div
            {...fade(0.05)}
            className="relative rounded-2xl border border-[var(--vf-border)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)] overflow-hidden"
          >
            {/* Subtle top accent stripe */}
            <div className="h-0.5 w-full bg-gradient-to-r from-[var(--vf-accent)]/0 via-[var(--vf-accent)]/60 to-[var(--vf-accent)]/0" />
            <div className="p-6 sm:p-8">
              <IntakeForm />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[var(--vf-border)] bg-[var(--bg-surface)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--vf-accent)] text-white">
              <Zap size={12} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)]">VentureForge AI</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Built for AICTE Problem Statement #20 · Powered by IBM Granite &amp; watsonx.ai</p>
        </div>
      </footer>

    </div>
  );
}

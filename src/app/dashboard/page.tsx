"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, BookOpen, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { SkeletonBlock } from "@/components/dashboard/SkeletonCard";
import { useBlueprintStore, type BlueprintOverview, type GenerateRequest } from "@/store/blueprintStore";

// ─── Industry-aware ambient orbs ─────────────────────────────────────────────
const INDUSTRY_ORB: Record<string, string> = {
  Agritech: "bg-emerald-500",
  Edtech: "bg-blue-500",
  Fintech: "bg-violet-500",
  Healthtech: "bg-cyan-500",
  Logistics: "bg-orange-400",
  "E-commerce": "bg-rose-500",
  "SaaS / B2B Software": "bg-indigo-500",
  "Clean Energy": "bg-teal-500",
  "Food & Beverage": "bg-amber-500",
  "Travel & Hospitality": "bg-sky-500",
  "Media & Entertainment": "bg-purple-500",
  Other: "bg-[var(--vf-accent)]",
};

function AmbientBackground({ industry }: { industry?: string }) {
  const colour = (industry && INDUSTRY_ORB[industry]) ?? "bg-[var(--vf-accent)]";
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className={`absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full ${colour} opacity-[0.04] blur-[80px]`} />
      <div className={`absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full ${colour} opacity-[0.03] blur-[70px]`} />
    </div>
  );
}

// ─── Small prose block ────────────────────────────────────────────────────────
function Prose({ text }: { text: string }) {
  return (
    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{text}</p>
  );
}

// ─── Pill / tag chip ──────────────────────────────────────────────────────────
function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--vf-border)] bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
      {label}
    </span>
  );
}

// ─── No-blueprint banner ──────────────────────────────────────────────────────
function EmptyBanner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--vf-accent-subtle)]">
        <AlertCircle size={22} className="text-[var(--vf-accent)]" />
      </div>
      <h2 className="text-heading text-[var(--text-primary)] mb-2">No blueprint yet</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">
        Go back to the home page and describe your startup idea to generate a blueprint.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--vf-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--vf-accent-hover)] transition-colors"
      >
        <ArrowLeft size={15} />
        Back to start
      </Link>
    </div>
  );
}

// ─── Budget parser — handles ranged strings like "₹5–10 lakhs" ───────────────
function parseBudgetINR(budget: string | undefined): number {
  if (!budget) return 1000000; // default ₹10 lakh
  const lower = budget.toLowerCase();

  // Handle known ranged budget strings from the intake form
  const rangeMap: Record<string, number> = {
    "under ₹5 lakhs": 300000,
    "₹5–10 lakhs": 750000,
    "₹5-10 lakhs": 750000,
    "₹10–50 lakhs": 3000000,
    "₹10-50 lakhs": 3000000,
    "₹50 lakhs – ₹1 crore": 7500000,
    "₹50 lakhs - ₹1 crore": 7500000,
    "over ₹1 crore": 15000000,
  };

  for (const [key, val] of Object.entries(rangeMap)) {
    if (lower.includes(key.replace("₹", ""))) return val;
  }
  // Check exact match first (strip rupee symbol for comparison)
  const normalized = lower.replace(/₹/g, "").trim();
  for (const [key, val] of Object.entries(rangeMap)) {
    if (normalized.includes(key.replace(/₹/g, "").trim())) return val;
  }

  // Fallback: try to parse a single number with unit suffix
  // Extract only the first contiguous number sequence
  const m = lower.match(/([\d.]+)/);
  if (!m) return 1000000;
  const num = parseFloat(m[1]);
  if (isNaN(num)) return 1000000;
  if (lower.includes("cr")) return num * 10000000;
  if (lower.includes("lakh") || lower.includes("lac")) return num * 100000;
  if (lower.includes("k")) return num * 1000;
  return num < 1000 ? num * 100000 : num; // bare numbers < 1000 assumed as lakhs
}

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

// ─── Financial Planning ───────────────────────────────────────────────────────

interface FinancialsSectionProps {
  blueprint: BlueprintOverview | null;
  intakeData: GenerateRequest | null;
}

function FinancialsSection({ blueprint, intakeData }: FinancialsSectionProps) {
  // Use sensible defaults so values are never blank
  const teamSize = intakeData?.teamSize ?? 3;
  const budgetStr = intakeData?.budget;
  const stageRaw = intakeData?.stage ?? "Idea";
  const totalBudgetINR = parseBudgetINR(budgetStr);

  // Stage-based salary assumptions (monthly per person, INR).
  // Keys normalised to lowercase to be resilient to "Pre-seed" vs "Pre-Seed".
  const stageSalaryMap: Record<string, number> = {
    idea: 40000,
    "pre-seed": 55000,
    seed: 75000,
    "series a": 120000,
    "series b": 160000,
  };
  const avgSalary = stageSalaryMap[stageRaw.toLowerCase()] ?? 60000;

  const staffCost = teamSize * avgSalary;
  const marketingBudget = Math.round(totalBudgetINR * 0.15);
  const toolingMisc = Math.round(totalBudgetINR * 0.08);
  const monthlyBurn = staffCost + marketingBudget + toolingMisc;
  const runwayMonths = monthlyBurn > 0
    ? parseFloat((totalBudgetINR / monthlyBurn).toFixed(1))
    : 0;
  const breakEvenMonth = Math.ceil(runwayMonths * 0.6);

  const assumptions = [
    { label: "Team Size", value: `${teamSize} ${teamSize === 1 ? "person" : "people"}` },
    { label: "Avg Monthly Salary / Person", value: fmt(avgSalary) },
    { label: "Monthly Staff Cost", value: fmt(staffCost) },
    { label: "Marketing Budget (15% of total)", value: fmt(marketingBudget) },
    { label: "Tooling & Misc (8% of total)", value: fmt(toolingMisc) },
  ];

  const estimates = [
    { label: "Total Budget", value: budgetStr ?? fmt(totalBudgetINR), highlight: false },
    { label: "Estimated Monthly Burn", value: fmt(monthlyBurn), highlight: true },
    { label: "Runway", value: `${runwayMonths} months`, highlight: true },
    { label: "Break-Even Target", value: `Month ${breakEvenMonth}`, highlight: false },
  ];

  if (!blueprint && !intakeData) {
    return <SkeletonBlock lines={6} />;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {/* Assumptions column */}
      <div>
        <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-4">
          Assumptions
        </p>
        <div className="divide-y divide-[var(--vf-border-subtle)]">
          {assumptions.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-[var(--text-secondary)]">{label}</span>
              <span className="text-sm font-semibold text-[var(--text-primary)] shrink-0 tabular-nums">
                {value}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-[var(--text-muted)] leading-relaxed">
          Salary benchmarks for <strong>{stageRaw}</strong>-stage startups in India.
          Adjust team size on the intake form for updated figures.
        </p>
      </div>

      {/* Estimates column */}
      <div className="rounded-xl border border-[var(--vf-border)] bg-[var(--bg-subtle)] p-5 flex flex-col gap-4">
        <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
          Estimates
        </p>
        <div className="flex-1 divide-y divide-[var(--vf-border-subtle)]">
          {estimates.map(({ label, value, highlight }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-[var(--text-secondary)]">{label}</span>
              <span
                className={`text-sm font-bold shrink-0 tabular-nums ${
                  highlight
                    ? "text-[var(--vf-accent)]"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--vf-border-subtle)] pt-3">
          Indicative estimates based on stated budget and team size. Actual costs vary by roles, city, and operating model.
        </p>
      </div>
    </div>
  );
}

// ─── Go-To-Market Strategy ────────────────────────────────────────────────────

interface GTMSectionProps {
  blueprint: BlueprintOverview | null;
  intakeData: GenerateRequest | null;
}

function buildGTMStages(blueprint: BlueprintOverview, intakeData: GenerateRequest | null) {
  const stageRaw = (intakeData?.stage ?? "Idea").toLowerCase();
  const industry = intakeData?.industry ?? "technology";
  const location = intakeData?.location ?? "India";

  // Normalise stage to determine active phase
  const activeStageIndex =
    ["idea", "pre-seed"].includes(stageRaw) ? 0
    : stageRaw === "seed" ? 1
    : stageRaw.includes("series a") ? 2
    : 3;

  // Safely truncate blueprint strings for action points
  const customers = blueprint.targetCustomers
    ? blueprint.targetCustomers.length > 90
      ? blueprint.targetCustomers.slice(0, 90) + "…"
      : blueprint.targetCustomers
    : "your target customers";

  const differentiator = blueprint.differentiator
    ? blueprint.differentiator.length > 90
      ? blueprint.differentiator.slice(0, 90) + "…"
      : blueprint.differentiator
    : "your unique value proposition";

  const revenueModel = blueprint.revenueModel
    ? blueprint.revenueModel.length > 90
      ? blueprint.revenueModel.slice(0, 90) + "…"
      : blueprint.revenueModel
    : "your revenue model";

  return [
    {
      title: "Validate",
      objective: "Confirm the problem is real and your solution creates value.",
      timeline: "Months 1–3",
      active: activeStageIndex === 0,
      actions: [
        `Run 20–30 discovery interviews with ${customers}`,
        `Build a landing page or mockup; measure sign-ups and waitlist interest in ${location}.`,
        "Find 5–10 design partners willing to test a rough MVP.",
        "Success metric: customers willing to pay or commit time.",
      ],
    },
    {
      title: "Pilot",
      objective: "Deploy a narrow MVP with design partners in one geography.",
      timeline: "Months 3–9",
      active: activeStageIndex === 1,
      actions: [
        `Limit rollout to one city or a single ${industry} customer segment.`,
        "Instrument usage analytics — track flows, drop-off, and activation.",
        "Run weekly feedback calls with pilot users; iterate fast.",
        "Success metrics: 30-day retention >40% (consumer) or >70% (B2B), NPS.",
      ],
    },
    {
      title: "Launch",
      objective: "Achieve repeatable, scalable customer acquisition.",
      timeline: "Months 9–18",
      active: activeStageIndex === 2,
      actions: [
        `Open to wider ${industry} market; activate 2–3 acquisition channels.`,
        `Lead with differentiator: ${differentiator}`,
        `Monetise via: ${revenueModel}`,
        "Success metrics: MoM MRR >15%, CAC by channel, payback period.",
      ],
    },
    {
      title: "Scale",
      objective: "Grow faster than the market by doubling down on proven channels.",
      timeline: "Month 18+",
      active: activeStageIndex === 3,
      actions: [
        "Hire channel-specific growth owners for every proven acquisition path.",
        `Expand to new geographies or segments beyond ${location}.`,
        "Invest in brand and community for organic, compounding growth.",
        "Success metrics: LTV:CAC > 3, payback period < 18 months, gross margin.",
      ],
    },
  ];
}

function GTMSection({ blueprint, intakeData }: GTMSectionProps) {
  const stageRaw = (intakeData?.stage ?? "").toLowerCase();

  if (!blueprint) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Validate", "Pilot", "Launch", "Scale"].map((stage, i) => (
          <div key={stage} className="rounded-xl border border-[var(--vf-border)] bg-[var(--bg-subtle)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--vf-accent-subtle)] text-[10px] font-bold text-[var(--vf-accent)]">
                {i + 1}
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{stage}</p>
            </div>
            <SkeletonBlock lines={3} />
          </div>
        ))}
      </div>
    );
  }

  const stages = buildGTMStages(blueprint, intakeData);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((s, i) => (
          <div
            key={s.title}
            className={`rounded-xl border p-4 transition-all duration-200 ${
              s.active
                ? "border-[var(--vf-accent)] bg-[var(--vf-accent-subtle)] shadow-[0_0_0_1px_var(--vf-accent)]"
                : "border-[var(--vf-border)] bg-[var(--bg-subtle)] hover:border-[var(--vf-accent)]/40 hover:bg-[var(--bg-hover)]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                  s.active
                    ? "bg-[var(--vf-accent)] text-white"
                    : "bg-[var(--bg-hover)] text-[var(--text-muted)]"
                }`}
              >
                {i + 1}
              </span>
              <p
                className={`text-sm font-semibold ${
                  s.active ? "text-[var(--vf-accent-text)]" : "text-[var(--text-primary)]"
                }`}
              >
                {s.title}
              </p>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mb-2">{s.timeline}</p>
            <p className="text-xs text-[var(--text-secondary)] italic mb-3 leading-relaxed">{s.objective}</p>
            <ul className="space-y-2">
              {s.actions.map((action, j) => (
                <li key={j} className="flex items-start gap-1.5">
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--vf-accent)] opacity-70" />
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{action}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {stageRaw && (
        <p className="text-[11px] text-[var(--text-muted)]">
          * The highlighted stage reflects your current <strong>{intakeData?.stage}</strong> phase. Stages before it are prerequisites; stages after are your roadmap.
        </p>
      )}
    </div>
  );
}

// ─── Funding & Schemes ────────────────────────────────────────────────────────

interface FundingSectionProps {
  intakeData: GenerateRequest | null;
}

const SCHEMES = [
  {
    name: "Startup India (DPIIT)",
    amount: "Tax exemption + Fund of Funds access",
    type: "Government",
    eligibility: "Pvt Ltd / LLP, ≤10 years, turnover < ₹100 Cr",
    highlight: "3-year income tax exemption; 80% rebate on patent fees; access to ₹10,000 Cr SIDBI FFS.",
    stages: ["idea", "pre-seed", "seed"],
    url: "https://startupindia.gov.in",
  },
  {
    name: "MUDRA Loan (PMMY)",
    amount: "Up to ₹10 lakhs",
    type: "Loan",
    eligibility: "Non-corporate micro/small enterprises, no collateral",
    highlight: "Shishu (≤₹50K), Kishore (₹50K–5L), Tarun (₹5–10L). Apply via any public bank or udyamimitra.in.",
    stages: ["idea", "pre-seed"],
    url: "https://udyamimitra.in",
  },
  {
    name: "SIDBI Startup Mitra",
    amount: "₹10L – ₹5 Cr @ 8.5–12% p.a.",
    type: "Loan",
    eligibility: "DPIIT-recognised, minimum 1 year of operations",
    highlight: "Collateral-free up to ₹25L with personal guarantee. Up to 5-year tenure.",
    stages: ["seed", "series a"],
    url: "https://sidbi.in",
  },
  {
    name: "Atal Innovation Mission",
    amount: "Up to ₹1 Cr (New India Challenges)",
    type: "Grant",
    eligibility: "DPIIT-recognised with working prototype",
    highlight: "Atal Incubation Centres, Tinkering Labs, and New India Challenges for deep-tech startups.",
    stages: ["seed", "series a"],
    url: "https://aim.gov.in",
  },
  {
    name: "NASSCOM 10,000 Startups",
    amount: "No equity — mentorship + cloud credits",
    type: "Programme",
    eligibility: "Indian tech startup, <5 years, pre-Series B",
    highlight: "AWS/GCP/Azure credits, investor connects, co-working access, market linkage.",
    stages: ["idea", "pre-seed", "seed"],
    url: "https://10000startups.com",
  },
  {
    name: "Angel / Seed Funding (India)",
    amount: "₹25L – ₹10 Cr",
    type: "Equity",
    eligibility: "Compelling problem + credible team + early traction",
    highlight: "Key networks: Indian Angel Network, Mumbai Angels, LetsVenture. Key funds: Blume, India Quotient, Antler, Elevation.",
    stages: ["pre-seed", "seed"],
    url: "https://letsventure.com",
  },
];

const TYPE_COLOURS: Record<string, string> = {
  Government: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40",
  Loan: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40",
  Grant: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40",
  Programme: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40",
  Equity: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40",
};

function FundingSection({ intakeData }: FundingSectionProps) {
  const stageRaw = (intakeData?.stage ?? "idea").toLowerCase();
  // Show all schemes if no stage set; otherwise prioritise relevant ones first
  const sorted = [...SCHEMES].sort((a, b) => {
    const aMatch = a.stages.includes(stageRaw) ? 0 : 1;
    const bMatch = b.stages.includes(stageRaw) ? 0 : 1;
    return aMatch - bMatch;
  });

  return (
    <div className="space-y-3">
      {intakeData?.stage && (
        <p className="text-[11px] text-[var(--text-muted)] mb-1">
          Schemes relevant to your <strong>{intakeData.stage}</strong> stage are shown first.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {sorted.map((scheme) => {
          const isRelevant = scheme.stages.includes(stageRaw);
          return (
            <div
              key={scheme.name}
              className={`rounded-xl border p-4 transition-colors ${
                isRelevant
                  ? "border-[var(--vf-accent)]/40 bg-[var(--vf-accent-subtle)]"
                  : "border-[var(--vf-border)] bg-[var(--bg-subtle)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{scheme.name}</p>
                <span
                  className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    TYPE_COLOURS[scheme.type] ?? ""
                  }`}
                >
                  {scheme.type}
                </span>
              </div>
              <p className="text-[11px] font-medium text-[var(--vf-accent-text)] mb-1.5">{scheme.amount}</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">{scheme.highlight}</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                <span className="font-medium">Eligibility:</span> {scheme.eligibility}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-[var(--text-muted)] pt-1">
        Sources: DPIIT, SIDBI, NITI Aayog, NASSCOM Startup Ecosystem Report 2024. Data is indicative — verify current terms before applying.
      </p>
    </div>
  );
}

// ─── Competitor Cards ─────────────────────────────────────────────────────────

interface CompetitorCardsProps {
  competitors: string[];
  differentiator: string;
}

function CompetitorCards({ competitors, differentiator }: CompetitorCardsProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!competitors || competitors.length === 0) {
    return <Prose text="No competitors identified." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {competitors.map((c, i) => {
          const isOpen = expanded === i;
          return (
            <button
              key={i}
              onClick={() => setExpanded(isOpen ? null : i)}
              className="group w-full text-left rounded-xl border border-[var(--vf-border)] bg-[var(--bg-subtle)] p-4 transition-all duration-200 hover:border-[var(--vf-accent)]/50 hover:bg-[var(--bg-hover)] hover:shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vf-accent)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--vf-accent-subtle)] text-[11px] font-bold text-[var(--vf-accent)]">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{c}</p>
                </div>
                <span className="shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:text-[var(--vf-accent)]">
                  {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-[var(--vf-border-subtle)] space-y-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Category</p>
                        <p className="text-xs text-[var(--text-secondary)]">{c}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Threat level</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {i === 0 ? "High — direct market overlap" : i === 1 ? "Medium — adjacent category" : "Low — indirect competition"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--vf-accent-text)] mb-1 flex items-center gap-1">
                          <TrendingUp size={11} /> Your edge
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{differentiator}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
      <div className="rounded-xl border border-[var(--vf-border)] bg-[var(--bg-subtle)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--vf-accent-text)] mb-2 flex items-center gap-1.5">
          <TrendingUp size={12} className="text-[var(--vf-accent)]" />
          Your Differentiator
        </p>
        <Prose text={differentiator} />
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { blueprint, intakeData, isGenerating } = useBlueprintStore();

  return (
    <>
      <AmbientBackground industry={intakeData?.industry} />
      <DashboardShell>
      <div className="space-y-6">

        {/* Empty state */}
        {!blueprint && !isGenerating && <EmptyBanner />}

        {/* ── Overview ── */}
        <SectionCard
          id="overview"
          title="Startup Overview"
          description="Problem, solution, value proposition and key opportunity signals."
        >
          {blueprint ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {intakeData?.stage && <Chip label={`Stage: ${intakeData.stage}`} />}
                {intakeData?.industry && <Chip label={intakeData.industry} />}
                {intakeData?.location && <Chip label={intakeData.location} />}
                {intakeData?.teamSize && <Chip label={`Team: ${intakeData.teamSize}`} />}
                {intakeData?.budget && <Chip label={intakeData.budget} />}
              </div>
              <Prose text={blueprint.overview} />
            </div>
          ) : (
            <SkeletonBlock lines={4} />
          )}
        </SectionCard>

        {/* ── Market Analysis / Problem & Solution ── */}
        <SectionCard
          id="market"
          title="Problem & Solution"
          description="The problem being solved and how this startup addresses it."
        >
          {blueprint ? (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Problem</p>
                <Prose text={blueprint.problem} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Solution</p>
                <Prose text={blueprint.solution} />
              </div>
            </div>
          ) : (
            <SkeletonBlock lines={5} />
          )}
        </SectionCard>

        {/* ── Target Customers (id="target-customers" so it doesn't conflict with funding nav) ── */}
        <SectionCard
          id="target-customers"
          title="Target Customers"
          description="Who the primary customers are and why they need this solution."
        >
          {blueprint ? (
            <Prose text={blueprint.targetCustomers} />
          ) : (
            <SkeletonBlock lines={3} />
          )}
        </SectionCard>

        {/* ── Business Model ── */}
        <SectionCard
          id="business-model"
          title="Business Model & Revenue"
          description="How the startup will generate revenue."
        >
          {blueprint ? (
            <Prose text={blueprint.revenueModel} />
          ) : (
            <SkeletonBlock lines={4} />
          )}
        </SectionCard>

        {/* ── Competitors ── */}
        <SectionCard
          id="competitors"
          title="Competitors"
          description="Competitor categories and your differentiation opportunity."
        >
          {blueprint ? (
            <CompetitorCards
              competitors={blueprint.competitors}
              differentiator={blueprint.differentiator}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[var(--vf-border)] bg-[var(--bg-subtle)] p-4">
                  <div className="h-4 w-40 rounded bg-[var(--bg-hover)] animate-pulse mb-3" />
                  <SkeletonBlock lines={2} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Funding & Schemes ── */}
        <SectionCard
          id="funding"
          title="Funding & Schemes"
          description="Relevant Indian government schemes, grants, and funding sources."
        >
          <FundingSection intakeData={intakeData} />
        </SectionCard>

        {/* ── Financial Planning ── */}
        <SectionCard
          id="financials"
          title="Financial Planning"
          description="Burn rate and runway estimates derived from your intake data."
        >
          <FinancialsSection blueprint={blueprint} intakeData={intakeData} />
        </SectionCard>

        {/* ── Go-To-Market ── */}
        <SectionCard
          id="gtm"
          title="Go-To-Market Strategy"
          description="Staged launch plan: Validate → Pilot → Launch → Scale."
        >
          <GTMSection blueprint={blueprint} intakeData={intakeData} />
        </SectionCard>

        {/* ── Risk Analysis ── */}
        <SectionCard
          id="risks"
          title="Risk Analysis"
          description="Key business risks identified for this startup."
        >
          {blueprint ? (
            <ul className="space-y-3">
              {blueprint.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--vf-accent-subtle)] text-[10px] font-bold text-[var(--vf-accent)]">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{risk}</p>
                </li>
              ))}
            </ul>
          ) : (
            <SkeletonBlock lines={6} />
          )}
        </SectionCard>

        {/* ── Final Blueprint ── */}
        <SectionCard
          id="blueprint"
          title="Final Blueprint"
          description="Consolidated investor-ready report — all sections in one view."
        >
                    {blueprint ? (
  <div className="space-y-5">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
        Startup Overview
      </p>
      <Prose text={blueprint.overview} />
    </div>

    <div className="grid sm:grid-cols-2 gap-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
          Problem & Solution
        </p>
        <Prose text={blueprint.problem} />
        <div className="mt-3">
          <Prose text={blueprint.solution} />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
          Target Customers
        </p>
        <Prose text={blueprint.targetCustomers} />
      </div>
    </div>

    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
        Competitors
      </p>
      <CompetitorCards
        competitors={blueprint.competitors}
        differentiator={blueprint.differentiator}
      />
    </div>

    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
        Revenue Model
      </p>
      <Prose text={blueprint.revenueModel} />
    </div>

    <FinancialsSection
      blueprint={blueprint}
      intakeData={intakeData}
    />

    <GTMSection
      blueprint={blueprint}
      intakeData={intakeData}
    />

    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
        Key Risks
      </p>
      <ul className="space-y-2">
        {blueprint.risks.map((risk, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--vf-accent)]" />
            {risk}
          </li>
        ))}
      </ul>
    </div>
  </div>
) : (
            <div className="rounded-xl border border-[var(--vf-border)] bg-[var(--bg-subtle)] p-6">
              <SkeletonBlock lines={8} />
            </div>
          )}
        </SectionCard>

      </div>
      </DashboardShell>
    </>
  );
}

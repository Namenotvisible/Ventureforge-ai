import { cn } from "@/lib/utils";

interface SkeletonLineProps {
  className?: string;
}

function SkeletonLine({ className }: SkeletonLineProps) {
  return (
    <div
      className={cn(
        "h-4 rounded-md bg-[var(--bg-subtle)] animate-pulse",
        className
      )}
    />
  );
}

interface SkeletonCardProps {
  id: string;
  title?: string;
  lines?: number;
  className?: string;
}

export function SkeletonCard({ id, lines = 4, className }: SkeletonCardProps) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border border-[var(--vf-border)] bg-[var(--bg-surface)]",
        "shadow-[var(--shadow-sm)] overflow-hidden scroll-mt-20",
        className
      )}
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--vf-border-subtle)]">
        <SkeletonLine className="h-5 w-40" />
      </div>

      {/* Body skeleton */}
      <div className="px-6 py-5 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            className={cn(
              i === lines - 1 ? "w-2/3" : i % 3 === 0 ? "w-full" : "w-5/6"
            )}
          />
        ))}
      </div>
    </section>
  );
}

/** Inline shimmer block — for use inside an existing SectionCard */
export function SkeletonBlock({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={cn(i === lines - 1 ? "w-1/2" : i % 2 === 0 ? "w-full" : "w-4/5")}
        />
      ))}
    </div>
  );
}

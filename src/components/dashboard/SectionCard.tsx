import { cn } from "@/lib/utils";

interface SectionCardProps {
  id: string;
  title: string;
  description?: string;
  className?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({
  id,
  title,
  description,
  className,
  headerAction,
  children,
}: SectionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border border-[var(--vf-border)] bg-[var(--bg-surface)]",
        "shadow-[var(--shadow-sm)]",
        "overflow-hidden",
        "scroll-mt-20", // offset for sticky header
        className
      )}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--vf-border-subtle)]">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] truncate">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-[var(--text-muted)] leading-snug">{description}</p>
          )}
        </div>
        {headerAction && (
          <div className="shrink-0">{headerAction}</div>
        )}
      </div>

      {/* Card body */}
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

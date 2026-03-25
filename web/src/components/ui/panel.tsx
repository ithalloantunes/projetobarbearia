import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PanelProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Panel({
  title,
  subtitle,
  actions,
  children,
  className
}: PanelProps) {
  return (
    <section className={cn("atelier-panel p-4 sm:p-5", className)}>
      {title || subtitle || actions ? (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  trend?: string;
  icon?: ReactNode;
  className?: string;
};

export default function StatCard({
  label,
  value,
  helper,
  trend,
  icon,
  className
}: StatCardProps) {
  return (
    <article className={cn("atelier-surface p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="atelier-label">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        {icon ? <div className="text-primary">{icon}</div> : null}
      </div>
      {helper ? <p className="mt-2 text-xs text-foreground-muted">{helper}</p> : null}
      {trend ? <p className="mt-1 text-xs font-semibold text-primary">{trend}</p> : null}
    </article>
  );
}

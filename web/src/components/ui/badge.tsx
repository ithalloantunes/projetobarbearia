import { cn } from "@/lib/cn";

type BadgeTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "muted";

const toneClass: Record<BadgeTone, string> = {
  default: "bg-surface-soft text-foreground border-outline",
  primary: "bg-primary/15 text-primary border-primary/45",
  success: "bg-success/15 text-success border-success/45",
  warning: "bg-warning/15 text-warning border-warning/45",
  danger: "bg-error/15 text-error border-error/45",
  muted: "bg-background-muted text-foreground-muted border-outline-variant"
};

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export default function Badge({ children, tone = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        toneClass[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

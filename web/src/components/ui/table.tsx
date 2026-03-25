import { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TableProps = {
  children: ReactNode;
  className?: string;
};

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: TableProps) {
  return <thead className="bg-surface-soft/80">{children}</thead>;
}

export function TBody({ children }: TableProps) {
  return <tbody className="divide-y divide-outline-variant/60">{children}</tbody>;
}

type THProps = ThHTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
};

type TDProps = TdHTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
};

export function TH({ children, className, ...props }: THProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-[11px] uppercase tracking-editorial font-semibold text-foreground-muted",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({ children, className, ...props }: TDProps) {
  return (
    <td className={cn("px-4 py-3 text-sm text-foreground", className)} {...props}>
      {children}
    </td>
  );
}

import { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
};

export default function Checkbox({ className, label, ...props }: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-foreground-muted">
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-outline text-primary focus:ring-primary/40",
          className
        )}
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
}

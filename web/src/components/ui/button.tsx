import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonIntent = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const intentClass: Record<ButtonIntent, string> = {
  primary:
    "atelier-gradient text-background border border-primary/40 shadow-atelier hover:brightness-105",
  secondary:
    "bg-surface-soft text-foreground border border-outline hover:border-primary/60 hover:text-primary",
  ghost:
    "bg-transparent text-foreground border border-outline-variant hover:border-primary/60 hover:text-primary",
  danger:
    "bg-error-container text-error border border-error/30 hover:bg-error/15 hover:text-error"
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs font-semibold",
  md: "h-10 px-4 text-sm font-semibold",
  lg: "h-11 px-5 text-sm font-bold"
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: ButtonIntent;
  size?: ButtonSize;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, intent = "primary", size = "md", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        intentClass[intent],
        sizeClass[size],
        className
      )}
      {...props}
    />
  );
});

export default Button;

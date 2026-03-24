import { cn } from "@/lib/cn";

type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export default function Switch({ checked, onChange, disabled, ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors disabled:opacity-60",
        checked
          ? "bg-primary-container border-primary/50"
          : "bg-surface-soft border-outline-variant"
      )}
    >
      <span
        className={cn(
          "h-4 w-4 rounded-full bg-surface shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

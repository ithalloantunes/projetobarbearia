import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type DrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
};

export default function Drawer({
  open,
  title,
  onClose,
  children,
  side = "right"
}: DrawerProps) {
  return (
    <div className={cn("fixed inset-0 z-[85]", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute top-0 h-full w-full max-w-md bg-background-elevated border-outline-variant shadow-float transition-transform",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            className="rounded-md border border-outline px-2 py-1 text-xs text-foreground-muted hover:border-primary hover:text-primary"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}

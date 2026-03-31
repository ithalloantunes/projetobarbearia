"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import { cn } from "@/lib/cn";

type ToastTone = "default" | "success" | "error";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (input: { title: string; description?: string; tone?: ToastTone }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClass: Record<ToastTone, string> = {
  default: "bg-surface text-foreground border-outline",
  success: "bg-success/15 text-success border-success/40",
  error: "bg-error/15 text-error border-error/40"
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((input: { title: string; description?: string; tone?: ToastTone }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? "default"
    };
    setToasts((previous) => [...previous.slice(-2), toast]);
    setTimeout(() => {
      setToasts((previous) => previous.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[95] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-md border px-3 py-2 shadow-atelier backdrop-blur",
              toneClass[toast.tone]
            )}
          >
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-xs opacity-90">{toast.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return context;
}

import { ReactNode } from "react";
import Button from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  busy?: boolean;
  danger?: boolean;
};

export default function Modal({
  open,
  title,
  description,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onCancel,
  onConfirm,
  busy,
  danger
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-lg atelier-panel p-5">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {description ? <p className="mt-2 text-sm text-foreground-muted">{description}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button intent="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          {onConfirm ? (
            <Button intent={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
              {busy ? "Processando..." : confirmLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

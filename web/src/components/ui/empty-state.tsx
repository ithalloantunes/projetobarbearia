import { ReactNode } from "react";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon = "inbox",
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="atelier-surface p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-foreground-muted">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

import { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  spotlight?: ReactNode;
};

export default function AuthShell({
  title,
  description,
  children,
  footer,
  spotlight
}: AuthShellProps) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1fr,460px]">
      <aside className="hidden border-r border-outline-variant/70 bg-background-elevated/75 p-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">content_cut</span>
            <span className="font-display text-2xl font-semibold">BarberSaaS</span>
          </Link>
          <p className="mt-6 max-w-md text-3xl font-semibold leading-tight text-foreground">
            O seu atelier digital para agenda, atendimento e fidelizacao.
          </p>
        </div>
        <div className="atelier-surface p-5">
          {spotlight ?? (
            <p className="text-sm text-foreground-muted">
              Controle total da barbearia com experiencia premium para clientes e equipe.
            </p>
          )}
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <p className="atelier-label">Acesso seguro</p>
            <h1 className="mt-1 text-3xl font-semibold text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-foreground-muted">{description}</p>
          </div>
          <div className="atelier-panel p-5 sm:p-6">{children}</div>
          {footer ? <div className="mt-4 text-sm text-foreground-muted">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

type PublicShellProps = {
  children: ReactNode;
  compact?: boolean;
};

export default function PublicShell({ children, compact }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-outline-variant/70 bg-background/85 backdrop-blur",
          compact ? "py-2" : "py-3"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">content_cut</span>
            <span className="font-display text-xl font-semibold">BarberSaaS</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-foreground-muted md:flex">
            <a href="#servicos" className="hover:text-primary">
              Servicos
            </a>
            <a href="#barbeiros" className="hover:text-primary">
              Barbeiros
            </a>
            <a href="#clientes" className="hover:text-primary">
              Clientes
            </a>
            <a href="#contato" className="hover:text-primary">
              Contato
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/entrar">
              <Button intent="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/agendar">
              <Button size="sm">Agendar</Button>
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

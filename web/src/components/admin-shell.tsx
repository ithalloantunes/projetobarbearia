"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import LogoutButton from "@/components/logout-button";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/agenda", label: "Agenda", icon: "calendar_month" },
  { href: "/admin/clientes", label: "Clientes", icon: "group" },
  { href: "/admin/equipe", label: "Equipe", icon: "badge" },
  { href: "/admin/servicos", label: "Servicos", icon: "content_cut" },
  { href: "/admin/relatorios", label: "Relatorios", icon: "bar_chart" },
  { href: "/admin/ajustes", label: "Ajustes", icon: "settings" }
];

type AdminShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export default function AdminShell({
  title,
  subtitle,
  actions,
  children
}: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[245px,1fr] sm:px-6">
        <aside className="atelier-panel h-fit p-4 lg:sticky lg:top-4">
          <div className="mb-4 flex items-center gap-2 border-b border-outline-variant/70 pb-4">
            <span className="material-symbols-outlined text-primary">content_cut</span>
            <div>
              <p className="font-display text-xl font-semibold leading-none">BarberSaaS</p>
              <p className="mt-1 text-[11px] uppercase tracking-editorial text-primary font-semibold">Admin</p>
            </div>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "border-primary/45 bg-primary/16 text-primary"
                      : "border-transparent text-foreground-muted hover:border-outline hover:text-primary"
                  )}
                >
                  <span className="material-symbols-outlined text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-outline-variant/70 pt-4">
            <LogoutButton className="w-full rounded-md border border-outline px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary" />
          </div>
        </aside>

        <main className="space-y-4">
          <header className="atelier-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="atelier-label">Workspace</p>
                <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
                {subtitle ? <p className="mt-2 text-sm text-foreground-muted">{subtitle}</p> : null}
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

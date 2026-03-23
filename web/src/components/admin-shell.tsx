"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import LogoutButton from "@/components/logout-button";

function itemClass(active: boolean) {
  return active
    ? "flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold"
    : "flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary transition-colors";
}

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

export default function AdminShell({ title, subtitle, actions, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid lg:grid-cols-[220px,1fr] gap-6">
        <aside className="rounded-2xl border border-primary/20 bg-white dark:bg-white/5 p-4 h-fit lg:sticky lg:top-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">content_cut</span>
            <div>
              <p className="font-bold leading-none">BarberSaaS</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-primary font-bold">Admin</p>
            </div>
          </div>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={itemClass(pathname === link.href || pathname.startsWith(`${link.href}/`))}
              >
                <span className="material-symbols-outlined text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-primary/10">
            <LogoutButton className="w-full px-3 py-2 rounded-xl border border-primary/20 text-sm font-bold hover:bg-primary/10 transition-colors" />
          </div>
        </aside>

        <main className="space-y-4">
          <header className="rounded-2xl border border-primary/20 bg-white dark:bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight">{title}</h1>
                {subtitle ? <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{subtitle}</p> : null}
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

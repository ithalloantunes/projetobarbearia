"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { cn } from "@/lib/cn";

const links = [
  { href: "/barbeiro", label: "Agenda" },
  { href: "/barbeiro/disponibilidade", label: "Disponibilidade" }
];

type BarberShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function BarberShell({
  title,
  subtitle,
  actions,
  children
}: BarberShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-outline-variant/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">content_cut</span>
              <p className="font-display text-xl font-semibold">Painel Barbeiro</p>
            </div>
            {subtitle ? <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <LogoutButton className="rounded-md border border-outline px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary" />
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 pb-3 sm:px-6">
          {links.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary/15 text-primary border border-primary/35"
                    : "text-foreground-muted hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
        {children}
      </main>
    </div>
  );
}

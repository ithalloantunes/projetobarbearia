"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { cn } from "@/lib/cn";

const links = [
  { href: "/cliente", label: "Painel", icon: "dashboard" },
  { href: "/agendar", label: "Agendar", icon: "event_upcoming" },
  { href: "/cliente/perfil", label: "Perfil", icon: "person" }
];

type ClientShellProps = {
  children: ReactNode;
};

export default function ClientShell({ children }: ClientShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/cliente" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">content_cut</span>
            <p className="font-display text-lg font-semibold">Area do Cliente</p>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary/15 text-primary border border-primary/40"
                      : "text-foreground-muted hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <LogoutButton className="rounded-md border border-outline px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-7 sm:px-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-background/95 p-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {links.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-3 py-1 text-[11px] font-semibold transition-colors",
                  active ? "text-primary" : "text-foreground-muted"
                )}
              >
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

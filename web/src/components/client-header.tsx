"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { cn } from "@/lib/cn";

function navClass(active: boolean) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
    active
      ? "bg-primary/15 text-primary border border-primary/35"
      : "text-foreground-muted hover:text-primary"
  );
}

export default function ClientHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">content_cut</span>
          <p className="font-display text-lg font-semibold">BarberSaaS Cliente</p>
        </div>
        <nav className="flex items-center gap-1">
          <Link href="/cliente" className={navClass(pathname === "/cliente")}>
            Painel
          </Link>
          <Link href="/agendar" className={navClass(pathname === "/agendar")}>
            Agendar
          </Link>
          <Link href="/cliente/perfil" className={navClass(pathname.startsWith("/cliente/perfil"))}>
            Perfil
          </Link>
        </nav>
        <LogoutButton className="rounded-md border border-outline px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary" />
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/logout-button";

function navClass(active: boolean) {
  return active
    ? "px-3 py-2 rounded-xl text-sm font-bold bg-primary/10 text-primary"
    : "px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary transition-colors";
}

export default function ClientHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-primary/20 bg-background-light/85 dark:bg-background-dark/85 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">content_cut</span>
          <p className="font-bold tracking-tight">BarberSaaS Cliente</p>
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
        <LogoutButton className="px-4 py-2 rounded-xl border border-primary/20 text-sm font-bold hover:bg-primary/10 transition-colors" />
      </div>
    </header>
  );
}

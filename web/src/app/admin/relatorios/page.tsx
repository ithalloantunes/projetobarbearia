"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";

type ReportsPayload = {
  summary: {
    totalAppointments: number;
    noShowCount: number;
    canceledCount: number;
    completedCount: number;
    confirmedCount: number;
    revenue: number;
    averageTicket: number;
  };
  topServices: Array<{ name: string; count: number; revenue: number }>;
  teamPerformance: Array<{ name: string; count: number; revenue: number }>;
  monthlyRevenue: Array<{ key: string; label: string; value: number }>;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminRelatoriosPage() {
  const [reports, setReports] = useState<ReportsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/reports");
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Falha ao carregar relatorios.");
        }
        if (!mounted) return;
        setReports(payload);
      } catch (loadError) {
        if (!mounted) return;
        const message = loadError instanceof Error ? loadError.message : "Falha ao carregar relatorios.";
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const maxMonthly = useMemo(() => Math.max(...(reports?.monthlyRevenue ?? []).map((item) => item.value), 1), [reports?.monthlyRevenue]);

  return (
    <AdminShell title="Relatorios gerenciais" subtitle="Performance da operacao e da equipe">
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      <section className="grid md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
          <p className="text-xs uppercase text-slate-500">Receita</p>
          <p className="text-xl font-black">{loading ? "..." : formatBRL(reports?.summary.revenue ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
          <p className="text-xs uppercase text-slate-500">Ticket medio</p>
          <p className="text-xl font-black">{loading ? "..." : formatBRL(reports?.summary.averageTicket ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
          <p className="text-xs uppercase text-slate-500">Concluidos</p>
          <p className="text-xl font-black">{loading ? "..." : reports?.summary.completedCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
          <p className="text-xs uppercase text-slate-500">No-show</p>
          <p className="text-xl font-black">{loading ? "..." : reports?.summary.noShowCount ?? 0}</p>
        </div>
      </section>

      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5">
        <h2 className="text-lg font-bold">Receita mensal</h2>
        <div className="mt-4 grid grid-cols-6 gap-2 items-end h-40">
          {(reports?.monthlyRevenue ?? []).map((item) => {
            const height = Math.max((item.value / maxMonthly) * 100, item.value > 0 ? 8 : 3);
            return (
              <div key={item.key} className="flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary" style={{ height: `${height}%` }}></div>
                <span className="text-[10px] text-slate-500 font-bold">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5">
          <h2 className="text-lg font-bold mb-3">Top servicos</h2>
          <div className="space-y-2">
            {(reports?.topServices ?? []).map((service) => (
              <div key={service.name} className="rounded-lg border border-primary/10 p-3 text-sm">
                <p className="font-bold">{service.name}</p>
                <p className="text-slate-500">{service.count} atendimentos</p>
                <p className="text-primary font-bold">{formatBRL(service.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5">
          <h2 className="text-lg font-bold mb-3">Performance da equipe</h2>
          <div className="space-y-2">
            {(reports?.teamPerformance ?? []).map((barber) => (
              <div key={barber.name} className="rounded-lg border border-primary/10 p-3 text-sm">
                <p className="font-bold">{barber.name}</p>
                <p className="text-slate-500">{barber.count} atendimentos</p>
                <p className="text-primary font-bold">{formatBRL(barber.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

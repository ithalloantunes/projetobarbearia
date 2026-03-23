"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type RevenuePoint = {
  key: string;
  label: string;
  value: number;
};

type UpcomingAppointment = {
  id: number;
  date: string;
  startTime: string;
  status: AppointmentStatus;
  client: { name: string };
  barber: { name: string };
  service: { name: string };
};

type MetricsPayload = {
  summary: {
    revenueMonth: number;
    newClientsMonth: number;
    appointmentsToday: number;
  };
  trends: {
    revenue: number;
    newClients: number;
    appointments: number;
  };
  revenueSeries: RevenuePoint[];
  upcomingAppointments: UpcomingAppointment[];
};

const statusLabel: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluido",
  CANCELED: "Cancelado",
  NO_SHOW: "No-show"
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatTime(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/metrics");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar dashboard.");
        }
        if (!mounted) return;
        setMetrics(data);
      } catch (loadError) {
        if (!mounted) return;
        const message = loadError instanceof Error ? loadError.message : "Falha ao carregar dashboard.";
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

  const maxRevenue = useMemo(() => {
    return Math.max(...(metrics?.revenueSeries ?? []).map((row) => row.value), 1);
  }, [metrics?.revenueSeries]);

  return (
    <AdminShell
      title="Resumo geral"
      subtitle="Visao executiva da operacao"
      actions={
        <Link
          href="/agendar"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background-dark hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Novo agendamento
        </Link>
      }
    >
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Faturamento do mes</p>
          <p className="mt-1 text-3xl font-black">{loading ? "..." : formatBRL(metrics?.summary.revenueMonth ?? 0)}</p>
          <p className="text-xs mt-2 text-slate-500">Trend: {metrics?.trends.revenue?.toFixed(1) ?? "0.0"}%</p>
        </div>
        <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Novos clientes</p>
          <p className="mt-1 text-3xl font-black">{loading ? "..." : metrics?.summary.newClientsMonth ?? 0}</p>
          <p className="text-xs mt-2 text-slate-500">Trend: {metrics?.trends.newClients?.toFixed(1) ?? "0.0"}%</p>
        </div>
        <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Agendamentos hoje</p>
          <p className="mt-1 text-3xl font-black">{loading ? "..." : metrics?.summary.appointmentsToday ?? 0}</p>
          <p className="text-xs mt-2 text-slate-500">Trend: {metrics?.trends.appointments?.toFixed(1) ?? "0.0"}%</p>
        </div>
      </section>

      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-5">
        <h2 className="text-lg font-bold">Receita 6 meses</h2>
        <div className="mt-4 grid grid-cols-6 gap-2 items-end h-40">
          {(metrics?.revenueSeries ?? []).map((row) => {
            const height = Math.max((row.value / maxRevenue) * 100, row.value > 0 ? 8 : 3);
            return (
              <div key={row.key} className="flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary"
                  style={{ height: `${height}%` }}
                  title={`${row.label}: ${formatBRL(row.value)}`}
                ></div>
                <span className="text-[10px] font-bold text-slate-500">{row.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-primary/10 flex items-center justify-between">
          <h2 className="text-lg font-bold">Proximos atendimentos</h2>
          <Link href="/admin/agenda" className="text-sm font-bold text-primary hover:underline">
            Abrir agenda completa
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-primary/10">
              <tr>
                <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Cliente</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Barbeiro</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Servico</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Data</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Horario</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-sm text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : (metrics?.upcomingAppointments ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-sm text-slate-500">
                    Nenhum atendimento encontrado.
                  </td>
                </tr>
              ) : (
                metrics?.upcomingAppointments.map((item) => (
                  <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium">{item.client.name}</td>
                    <td className="px-5 py-4 text-sm">{item.barber.name}</td>
                    <td className="px-5 py-4 text-sm">{item.service.name}</td>
                    <td className="px-5 py-4 text-sm">{formatDate(item.date)}</td>
                    <td className="px-5 py-4 text-sm">{formatTime(item.startTime)}</td>
                    <td className="px-5 py-4 text-sm">{statusLabel[item.status]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

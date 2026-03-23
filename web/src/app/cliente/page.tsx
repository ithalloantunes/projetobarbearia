"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ClientHeader from "@/components/client-header";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type Appointment = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string | null;
  service: {
    id: number;
    name: string;
  };
  barber: {
    id: number;
    name: string;
  };
  payment?: {
    id: number;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    method: string;
  } | null;
};

type AppointmentsPayload = {
  appointments: Appointment[];
  summary: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    canceled: number;
    noShow: number;
  };
};

const statusLabel: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluido",
  CANCELED: "Cancelado",
  NO_SHOW: "No-show"
};

const statusClass: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 border border-amber-600/20",
  CONFIRMED: "bg-blue-500/10 text-blue-700 border border-blue-600/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 border border-emerald-600/20",
  CANCELED: "bg-red-500/10 text-red-700 border border-red-600/20",
  NO_SHOW: "bg-slate-500/10 text-slate-700 border border-slate-600/20"
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export default function ClientePage() {
  const [data, setData] = useState<AppointmentsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
        const response = await fetch(`/api/client/appointments${query}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Falha ao carregar seus agendamentos.");
        }
        if (!mounted) return;
        setData(payload);
      } catch (loadError) {
        if (!mounted) return;
        const message = loadError instanceof Error ? loadError.message : "Falha ao carregar seus agendamentos.";
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [statusFilter]);

  const nextAppointment = useMemo(() => {
    const source = data?.appointments ?? [];
    return source
      .filter((item) => item.status === "PENDING" || item.status === "CONFIRMED")
      .sort((a, b) => {
        const aDate = new Date(`${a.date.slice(0, 10)}T${formatTime(a.startTime)}:00`).getTime();
        const bDate = new Date(`${b.date.slice(0, 10)}T${formatTime(b.startTime)}:00`).getTime();
        return aDate - bDate;
      })[0];
  }, [data?.appointments]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <ClientHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        <section className="rounded-2xl border border-primary/20 bg-white dark:bg-white/5 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-primary font-bold">Area do cliente</p>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">Meus agendamentos</h1>
            </div>
            <Link
              href="/agendar"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-background-dark font-bold hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Novo agendamento
            </Link>
          </div>
          {nextAppointment ? (
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs uppercase tracking-wider text-primary font-bold">Proximo horario</p>
              <p className="text-lg font-bold mt-1">
                {nextAppointment.service.name} com {nextAppointment.barber.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {formatDate(nextAppointment.date)} as {formatTime(nextAppointment.startTime)}
              </p>
            </div>
          ) : null}
        </section>

        <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-500">Total</p>
            <p className="text-2xl font-black">{data?.summary.total ?? 0}</p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-500">Pendente</p>
            <p className="text-2xl font-black">{data?.summary.pending ?? 0}</p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-500">Confirmado</p>
            <p className="text-2xl font-black">{data?.summary.confirmed ?? 0}</p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-500">Concluido</p>
            <p className="text-2xl font-black">{data?.summary.completed ?? 0}</p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-500">Cancelado</p>
            <p className="text-2xl font-black">{data?.summary.canceled ?? 0}</p>
          </div>
          <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-500">No-show</p>
            <p className="text-2xl font-black">{data?.summary.noShow ?? 0}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-primary/10 bg-white dark:bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-primary/10 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Historico</h2>
            <select
              className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | "ALL")}
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="COMPLETED">Concluido</option>
              <option value="CANCELED">Cancelado</option>
              <option value="NO_SHOW">No-show</option>
            </select>
          </div>

          {error ? <div className="p-4 text-sm text-red-500">{error}</div> : null}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-primary/10">
                <tr>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Servico</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Barbeiro</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Data</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Horario</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-slate-500 text-right">Acao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-sm text-slate-500">
                      Carregando...
                    </td>
                  </tr>
                ) : (data?.appointments ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-sm text-slate-500">
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                ) : (
                  data?.appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium">{appointment.service.name}</td>
                      <td className="px-5 py-4 text-sm">{appointment.barber.name}</td>
                      <td className="px-5 py-4 text-sm">{formatDate(appointment.date)}</td>
                      <td className="px-5 py-4 text-sm">{formatTime(appointment.startTime)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${statusClass[appointment.status]}`}>
                          {statusLabel[appointment.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/cliente/agendamentos/${appointment.id}`}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

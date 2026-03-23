"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type Appointment = {
  id: number;
  date: string;
  startTime: string;
  status: AppointmentStatus;
  price: number | string;
  client: { name: string; email: string | null };
  barber: { name: string };
  service: { name: string };
  payment?: {
    id: number;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    method: string;
  } | null;
};

const statusOptions: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function todayDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function AdminAgendaPage() {
  const [dateFrom, setDateFrom] = useState(todayDate());
  const [dateTo, setDateTo] = useState(todayDate());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/appointments?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao carregar agenda.");
      }
      setAppointments(payload.appointments ?? []);
    } catch (loadError) {
      const messageText = loadError instanceof Error ? loadError.message : "Falha ao carregar agenda.";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(appointmentId: number, status: AppointmentStatus) {
    setBusyId(appointmentId);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao atualizar status.");
      }
      setMessage("Status atualizado.");
      await load();
    } catch (updateError) {
      const messageText = updateError instanceof Error ? updateError.message : "Falha ao atualizar status.";
      setError(messageText);
    } finally {
      setBusyId(null);
    }
  }

  async function registerPayment(appointmentId: number) {
    setBusyId(appointmentId);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          method: "BALCAO",
          status: "PAID"
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao registrar pagamento.");
      }
      setMessage("Pagamento registrado.");
      await load();
    } catch (paymentError) {
      const messageText = paymentError instanceof Error ? paymentError.message : "Falha ao registrar pagamento.";
      setError(messageText);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell title="Agenda operacional" subtitle="Controle de atendimentos, status e pagamentos">
      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="block text-xs uppercase text-slate-500 mb-1">Data inicial</span>
            <input
              type="date"
              className="rounded-xl border border-primary/20 bg-transparent px-3 py-2"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="block text-xs uppercase text-slate-500 mb-1">Data final</span>
            <input
              type="date"
              className="rounded-xl border border-primary/20 bg-transparent px-3 py-2"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded-xl bg-primary text-background-dark font-bold text-sm hover:brightness-110"
          >
            Filtrar
          </button>
        </div>
        {error ? <p className="text-sm text-red-500 mt-3">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-500 mt-3">{message}</p> : null}
      </section>

      <section className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-primary/10">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Cliente</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Barbeiro</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Servico</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Data</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Horario</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-sm text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-sm text-slate-500">
                    Nenhum agendamento encontrado no periodo.
                  </td>
                </tr>
              ) : (
                appointments.map((item) => (
                  <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">{item.client.name}</p>
                      <p className="text-xs text-slate-500">{item.client.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.barber.name}</td>
                    <td className="px-4 py-3 text-sm">{item.service.name}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(item.date)}</td>
                    <td className="px-4 py-3 text-sm">{formatTime(item.startTime)}</td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        className="rounded-lg border border-primary/20 bg-transparent px-2 py-1 text-xs"
                        value={item.status}
                        disabled={busyId === item.id}
                        onChange={(event) => updateStatus(item.id, event.target.value as AppointmentStatus)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.payment?.status === "PAID" ? (
                        <span className="text-emerald-500 font-bold text-xs">Pago ({item.payment.method})</span>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => registerPayment(item.id)}
                          className="rounded-lg border border-primary/30 px-2 py-1 text-xs font-bold hover:bg-primary/10 disabled:opacity-60"
                        >
                          Marcar pago
                        </button>
                      )}
                    </td>
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

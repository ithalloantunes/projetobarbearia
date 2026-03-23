"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ClientHeader from "@/components/client-header";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type AppointmentPayload = {
  appointment: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    notes?: string | null;
    service: { id: number; name: string; price: number | string };
    barber: { id: number; name: string };
    payment?: { status: "PENDING" | "PAID" | "FAILED" | "REFUNDED"; method: string } | null;
  };
};

const statusLabel: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluido",
  CANCELED: "Cancelado",
  NO_SHOW: "No-show"
};

function dateOnly(dateIso: string) {
  return dateIso.slice(0, 10);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export default function ClienteAppointmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const appointmentId = Number(params.id);
  const [payload, setPayload] = useState<AppointmentPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadAppointment() {
    if (!appointmentId || Number.isNaN(appointmentId)) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao carregar agendamento.");
      }
      setPayload(data);
      setSelectedDate(dateOnly(data.appointment.date));
      setSelectedTime(formatTime(data.appointment.startTime));
    } catch (loadError) {
      const messageText = loadError instanceof Error ? loadError.message : "Falha ao carregar agendamento.";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  useEffect(() => {
    const appointment = payload?.appointment;
    if (!appointment || !selectedDate) {
      return;
    }
    const targetAppointment = appointment;

    let mounted = true;
    async function loadSlots() {
      try {
        const response = await fetch(
          `/api/availability?barberId=${targetAppointment.barber.id}&serviceId=${targetAppointment.service.id}&date=${selectedDate}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar horarios.");
        }
        if (!mounted) return;
        const slots = Array.isArray(data.slots) ? data.slots : [];
        setAvailableTimes(slots);
        if (slots.includes(selectedTime)) {
          return;
        }
        setSelectedTime(slots[0] ?? "");
      } catch {
        if (!mounted) return;
        setAvailableTimes([]);
      }
    }

    loadSlots();
    return () => {
      mounted = false;
    };
  }, [payload?.appointment, selectedDate, selectedTime]);

  async function handleCancel() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELED" })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao cancelar agendamento.");
      }
      setMessage("Agendamento cancelado com sucesso.");
      await loadAppointment();
    } catch (cancelError) {
      const messageText = cancelError instanceof Error ? cancelError.message : "Falha ao cancelar agendamento.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  async function handleReschedule() {
    if (!selectedDate || !selectedTime) {
      setError("Selecione data e horario para remarcar.");
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/client/appointments/${appointmentId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, time: selectedTime })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha ao remarcar.");
      }
      setMessage("Agendamento remarcado com sucesso.");
      await loadAppointment();
    } catch (rescheduleError) {
      const messageText = rescheduleError instanceof Error ? rescheduleError.message : "Falha ao remarcar.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  const appointment = payload?.appointment;
  const canUpdate = useMemo(() => {
    if (!appointment) return false;
    return appointment.status === "PENDING" || appointment.status === "CONFIRMED";
  }, [appointment]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <ClientHeader />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        <Link href="/cliente" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Voltar para o painel
        </Link>

        {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div> : null}
        {message ? <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{message}</div> : null}

        <section className="rounded-2xl border border-primary/10 bg-white dark:bg-white/5 p-6">
          {loading || !appointment ? (
            <p className="text-sm text-slate-500">Carregando agendamento...</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-black">Agendamento #{appointment.id}</h1>
                <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-primary/10 text-primary border border-primary/20">
                  {statusLabel[appointment.status]}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-primary/10 p-4">
                  <p className="text-xs uppercase text-slate-500">Servico</p>
                  <p className="font-bold mt-1">{appointment.service.name}</p>
                </div>
                <div className="rounded-xl border border-primary/10 p-4">
                  <p className="text-xs uppercase text-slate-500">Barbeiro</p>
                  <p className="font-bold mt-1">{appointment.barber.name}</p>
                </div>
                <div className="rounded-xl border border-primary/10 p-4">
                  <p className="text-xs uppercase text-slate-500">Data</p>
                  <p className="font-bold mt-1">{formatDate(appointment.date)}</p>
                </div>
                <div className="rounded-xl border border-primary/10 p-4">
                  <p className="text-xs uppercase text-slate-500">Horario</p>
                  <p className="font-bold mt-1">{formatTime(appointment.startTime)}</p>
                </div>
                <div className="rounded-xl border border-primary/10 p-4">
                  <p className="text-xs uppercase text-slate-500">Valor</p>
                  <p className="font-bold mt-1">R$ {Number(appointment.service.price).toFixed(2).replace(".", ",")}</p>
                </div>
                <div className="rounded-xl border border-primary/10 p-4">
                  <p className="text-xs uppercase text-slate-500">Pagamento</p>
                  <p className="font-bold mt-1">
                    {appointment.payment ? `${appointment.payment.status} (${appointment.payment.method})` : "Pendente"}
                  </p>
                </div>
              </div>

              {canUpdate ? (
                <div className="rounded-xl border border-primary/10 p-4 space-y-4">
                  <h2 className="font-bold">Remarcar horario</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="block mb-1 text-slate-500">Nova data</span>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2"
                        value={selectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block mb-1 text-slate-500">Novo horario</span>
                      <select
                        className="w-full rounded-xl border border-primary/20 bg-transparent px-3 py-2"
                        value={selectedTime}
                        onChange={(event) => setSelectedTime(event.target.value)}
                      >
                        {availableTimes.length === 0 ? (
                          <option value="">Sem horarios</option>
                        ) : (
                          availableTimes.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))
                        )}
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleReschedule}
                      disabled={saving || !selectedDate || !selectedTime}
                      className="px-4 py-2 rounded-xl bg-primary text-background-dark font-bold text-sm disabled:opacity-60"
                    >
                      {saving ? "Salvando..." : "Confirmar remarcacao"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl border border-red-500/30 text-red-500 font-bold text-sm hover:bg-red-500/10 disabled:opacity-60"
                    >
                      Cancelar agendamento
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Este agendamento nao pode mais ser alterado.
                </p>
              )}

              <button
                type="button"
                onClick={() => router.push("/agendar")}
                className="px-4 py-2 rounded-xl border border-primary/20 text-sm font-bold hover:bg-primary/10"
              >
                Fazer novo agendamento
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

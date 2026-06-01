"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ClientShell from "@/components/shells/client-shell";
import {
  Badge,
  Button,
  Input,
  Modal,
  Panel,
  SectionHeader,
  Select
} from "@/components/ui";

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

const statusTone: Record<
  AppointmentStatus,
  "warning" | "primary" | "success" | "danger" | "muted"
> = {
  PENDING: "warning",
  CONFIRMED: "primary",
  COMPLETED: "success",
  CANCELED: "danger",
  NO_SHOW: "muted"
};

function dateOnly(dateIso: string) {
  return dateIso.slice(0, 10);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
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
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

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
    const currentAppointment = appointment;

    let mounted = true;
    async function loadSlots() {
      try {
        const response = await fetch(
          `/api/availability?barberId=${currentAppointment.barber.id}&serviceId=${currentAppointment.service.id}&date=${selectedDate}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar horarios.");
        }
        if (!mounted) return;
        const slots = Array.isArray(data.slots) ? data.slots : [];
        setAvailableTimes(slots);
        if (!slots.includes(selectedTime)) {
          setSelectedTime(slots[0] ?? "");
        }
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
      setCancelModalOpen(false);
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
    <ClientShell>
      <SectionHeader
        eyebrow="Detalhes"
        title={`Agendamento #${appointmentId || "-"}`}
        description="Acompanhe status, pagamento e remarcacao do seu atendimento."
        actions={
          <Link href="/cliente">
            <Button intent="ghost">Voltar para painel</Button>
          </Link>
        }
      />

      {error ? <p className="mt-5 text-sm text-error">{error}</p> : null}
      {message ? <p className="mt-5 text-sm text-success">{message}</p> : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr,330px]">
        <Panel>
          {loading || !appointment ? (
            <p className="text-sm text-foreground-muted">Carregando agendamento...</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-semibold">{appointment.service.name}</h2>
                <Badge tone={statusTone[appointment.status]}>{statusLabel[appointment.status]}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="atelier-surface p-3">
                  <p className="atelier-label">Barbeiro</p>
                  <p className="font-semibold">{appointment.barber.name}</p>
                </div>
                <div className="atelier-surface p-3">
                  <p className="atelier-label">Data</p>
                  <p className="font-semibold">{formatDate(appointment.date)}</p>
                </div>
                <div className="atelier-surface p-3">
                  <p className="atelier-label">Horario</p>
                  <p className="font-semibold">{formatTime(appointment.startTime)}</p>
                </div>
                <div className="atelier-surface p-3">
                  <p className="atelier-label">Pagamento</p>
                  <p className="font-semibold">
                    {appointment.payment
                      ? `${appointment.payment.status} (${appointment.payment.method})`
                      : "Pendente"}
                  </p>
                </div>
                <div className="atelier-surface p-3 sm:col-span-2">
                  <p className="atelier-label">Valor</p>
                  <p className="font-semibold text-primary">
                    R$ {Number(appointment.service.price).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>

              <div className="atelier-surface p-4">
                <p className="atelier-label">Timeline</p>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <p>Reserva criada e confirmada no sistema.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-outline" />
                    <p>Status atual: {statusLabel[appointment.status]}.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Acoes do agendamento">
          {appointment && canUpdate ? (
            <div className="space-y-4">
              <label className="block space-y-1 text-sm">
                <span className="atelier-label">Nova data</span>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="atelier-label">Novo horario</span>
                <Select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {availableTimes.length === 0 ? (
                    <option value="">Sem horarios</option>
                  ) : (
                    availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))
                  )}
                </Select>
              </label>

              <Button onClick={handleReschedule} className="w-full" disabled={saving || !selectedDate || !selectedTime}>
                {saving ? "Salvando..." : "Confirmar remarcacao"}
              </Button>
              <Button intent="danger" className="w-full" onClick={() => setCancelModalOpen(true)} disabled={saving}>
                Cancelar agendamento
              </Button>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">Este agendamento nao pode mais ser alterado.</p>
          )}

          <Button
            intent="secondary"
            className="mt-3 w-full"
            onClick={() => router.push("/agendar")}
          >
            Fazer novo agendamento
          </Button>
        </Panel>
      </section>

      <Modal
        open={cancelModalOpen}
        title="Cancelar agendamento?"
        description="Esta acao libera o horario e nao pode ser desfeita."
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        onCancel={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        busy={saving}
        danger
      />
    </ClientShell>
  );
}

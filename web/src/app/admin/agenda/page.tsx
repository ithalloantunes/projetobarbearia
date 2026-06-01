"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-shell";
import {
  Badge,
  Button,
  Input,
  Panel,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead
} from "@/components/ui";

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
    <AdminShell title="Agenda operacional" subtitle="Controle de atendimentos, status e caixa">
      <Panel>
        <div className="grid gap-2 md:grid-cols-[1fr,1fr,130px]">
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <Button onClick={load} size="sm">
            Filtrar
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
      </Panel>

      <Panel className="mt-4">
        <Table>
          <THead>
            <tr>
              <TH>Cliente</TH>
              <TH>Barbeiro</TH>
              <TH>Servico</TH>
              <TH>Data</TH>
              <TH>Horario</TH>
              <TH>Status</TH>
              <TH>Pagamento</TH>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <tr>
                <TD colSpan={7} className="text-foreground-muted">
                  Carregando...
                </TD>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <TD colSpan={7} className="text-foreground-muted">
                  Nenhum agendamento encontrado no periodo.
                </TD>
              </tr>
            ) : (
              appointments.map((item) => (
                <tr key={item.id} className="hover:bg-surface-soft/55">
                  <TD>
                    <p className="font-semibold">{item.client.name}</p>
                    <p className="text-xs text-foreground-muted">{item.client.email}</p>
                  </TD>
                  <TD>{item.barber.name}</TD>
                  <TD>{item.service.name}</TD>
                  <TD>{formatDate(item.date)}</TD>
                  <TD>{formatTime(item.startTime)}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          item.status === "CONFIRMED"
                            ? "primary"
                            : item.status === "COMPLETED"
                              ? "success"
                              : item.status === "PENDING"
                                ? "warning"
                                : item.status === "CANCELED"
                                  ? "danger"
                                  : "muted"
                        }
                      >
                        {item.status}
                      </Badge>
                      <Select
                        value={item.status}
                        disabled={busyId === item.id}
                        onChange={(event) => updateStatus(item.id, event.target.value as AppointmentStatus)}
                        className="w-36"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </TD>
                  <TD>
                    {item.payment?.status === "PAID" ? (
                      <Badge tone="success">Pago ({item.payment.method})</Badge>
                    ) : (
                      <Button
                        intent="secondary"
                        size="sm"
                        disabled={busyId === item.id}
                        onClick={() => registerPayment(item.id)}
                      >
                        Marcar pago
                      </Button>
                    )}
                  </TD>
                </tr>
              ))
            )}
          </TBody>
        </Table>
      </Panel>
    </AdminShell>
  );
}

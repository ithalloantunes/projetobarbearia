"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ClientShell from "@/components/shells/client-shell";
import {
  Badge,
  Button,
  EmptyState,
  Panel,
  SectionHeader,
  StatCard,
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
  insights: {
    totalInvested: number;
    loyaltyPoints: number;
    membershipTier: string;
    completedAppointments: number;
    recommendedService: string;
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

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
    <ClientShell>
      <SectionHeader
        eyebrow="Cliente"
        title="Meu dashboard"
        description="Resumo dos atendimentos, fidelidade e proximas reservas."
        actions={
          <Link href="/agendar">
            <Button>
              <span className="material-symbols-outlined text-base">add</span>
              Novo agendamento
            </Button>
          </Link>
        }
      />

      {nextAppointment ? (
        <Panel className="mt-6">
          <p className="atelier-label">Proximo horario</p>
          <p className="mt-1 text-xl font-semibold">
            {nextAppointment.service.name} com {nextAppointment.barber.name}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            {formatDate(nextAppointment.date)} as {formatTime(nextAppointment.startTime)}
          </p>
        </Panel>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon="calendar_month"
            title="Sem agendamentos ativos"
            description="Que tal reservar um novo horario agora mesmo?"
            action={
              <Link href="/agendar">
                <Button>Agendar atendimento</Button>
              </Link>
            }
          />
        </div>
      )}

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total" value={data?.summary.total ?? 0} />
        <StatCard label="Pontos" value={data?.insights.loyaltyPoints ?? 0} helper="Programa de fidelidade" />
        <StatCard label="Tier" value={data?.insights.membershipTier ?? "Classic"} />
        <StatCard
          label="Investimento"
          value={formatBRL(data?.insights.totalInvested ?? 0)}
          helper="Historico concluido"
        />
        <StatCard label="Servico favorito" value={data?.insights.recommendedService ?? "-"} />
      </section>

      <Panel className="mt-6" title="Historico de agendamentos">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="atelier-label">Filtrar status</span>
          <select
            className="rounded-md border border-outline bg-surface px-3 py-2 text-sm"
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

        {error ? <p className="mb-4 text-sm text-error">{error}</p> : null}

        <Table>
          <THead>
            <tr>
              <TH>Servico</TH>
              <TH>Barbeiro</TH>
              <TH>Data</TH>
              <TH>Horario</TH>
              <TH>Status</TH>
              <TH className="text-right">Acao</TH>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <tr>
                <TD colSpan={6} className="text-foreground-muted">
                  Carregando...
                </TD>
              </tr>
            ) : (data?.appointments ?? []).length === 0 ? (
              <tr>
                <TD colSpan={6}>
                  <EmptyState
                    icon="history"
                    title="Nenhum agendamento encontrado"
                    description="Ajuste o filtro ou faça um novo agendamento."
                  />
                </TD>
              </tr>
            ) : (
              data?.appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-surface-soft/55">
                  <TD className="font-semibold">{appointment.service.name}</TD>
                  <TD>{appointment.barber.name}</TD>
                  <TD>{formatDate(appointment.date)}</TD>
                  <TD>{formatTime(appointment.startTime)}</TD>
                  <TD>
                    <Badge tone={statusTone[appointment.status]}>{statusLabel[appointment.status]}</Badge>
                  </TD>
                  <TD className="text-right">
                    <Link
                      href={`/cliente/agendamentos/${appointment.id}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Ver detalhes
                    </Link>
                  </TD>
                </tr>
              ))
            )}
          </TBody>
        </Table>
      </Panel>
    </ClientShell>
  );
}

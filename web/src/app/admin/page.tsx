"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";
import {
  Badge,
  Button,
  Panel,
  StatCard,
  Table,
  TBody,
  TD,
  TH,
  THead
} from "@/components/ui";

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

type AlertItem = {
  level: "warning" | "info" | "danger";
  title: string;
  action: string;
};

type MetricsPayload = {
  summary: {
    revenueMonth: number;
    newClientsMonth: number;
    appointmentsToday: number;
    pendingToday: number;
    openPayments: number;
  };
  trends: {
    revenue: number;
    newClients: number;
    appointments: number;
  };
  revenueSeries: RevenuePoint[];
  upcomingAppointments: UpcomingAppointment[];
  alerts: AlertItem[];
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

  const maxRevenue = useMemo(
    () => Math.max(...(metrics?.revenueSeries ?? []).map((row) => row.value), 1),
    [metrics?.revenueSeries]
  );

  return (
    <AdminShell
      title="Resumo geral"
      subtitle="Visao executiva da operacao em tempo real."
      actions={
        <Link href="/agendar">
          <Button size="sm">
            <span className="material-symbols-outlined text-base">add</span>
            Novo agendamento
          </Button>
        </Link>
      }
    >
      {error ? <p className="text-sm text-error">{error}</p> : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Receita do mes"
          value={loading ? "..." : formatBRL(metrics?.summary.revenueMonth ?? 0)}
          trend={`${metrics?.trends.revenue?.toFixed(1) ?? "0.0"}%`}
        />
        <StatCard
          label="Novos clientes"
          value={loading ? "..." : metrics?.summary.newClientsMonth ?? 0}
          trend={`${metrics?.trends.newClients?.toFixed(1) ?? "0.0"}%`}
        />
        <StatCard
          label="Agenda hoje"
          value={loading ? "..." : metrics?.summary.appointmentsToday ?? 0}
          trend={`${metrics?.trends.appointments?.toFixed(1) ?? "0.0"}%`}
        />
        <StatCard label="Pendentes hoje" value={loading ? "..." : metrics?.summary.pendingToday ?? 0} />
        <StatCard label="Pagamentos em aberto" value={loading ? "..." : metrics?.summary.openPayments ?? 0} />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr,320px]">
        <Panel title="Receita 6 meses">
          <div className="grid h-44 grid-cols-6 items-end gap-2">
            {(metrics?.revenueSeries ?? []).map((row) => {
              const height = Math.max((row.value / maxRevenue) * 100, row.value > 0 ? 8 : 3);
              return (
                <div key={row.key} className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md atelier-gradient" style={{ height: `${height}%` }} />
                  <span className="text-[11px] font-semibold text-foreground-muted">{row.label}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Alertas prioritarios">
          <div className="space-y-2">
            {(metrics?.alerts ?? []).length === 0 ? (
              <p className="text-sm text-foreground-muted">Sem alertas criticos no momento.</p>
            ) : (
              metrics?.alerts.map((alert) => (
                <div key={alert.title} className="atelier-surface p-3">
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="mt-1 text-xs text-foreground-muted">{alert.action}</p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>

      <Panel className="mt-4" title="Proximos atendimentos" subtitle="Fila operacional para acompanhamento rapido">
        <Table>
          <THead>
            <tr>
              <TH>Cliente</TH>
              <TH>Barbeiro</TH>
              <TH>Servico</TH>
              <TH>Data</TH>
              <TH>Horario</TH>
              <TH>Status</TH>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              <tr>
                <TD colSpan={6} className="text-foreground-muted">
                  Carregando...
                </TD>
              </tr>
            ) : (metrics?.upcomingAppointments ?? []).length === 0 ? (
              <tr>
                <TD colSpan={6} className="text-foreground-muted">
                  Nenhum atendimento encontrado.
                </TD>
              </tr>
            ) : (
              metrics?.upcomingAppointments.map((item) => (
                <tr key={item.id} className="hover:bg-surface-soft/50">
                  <TD className="font-semibold">{item.client.name}</TD>
                  <TD>{item.barber.name}</TD>
                  <TD>{item.service.name}</TD>
                  <TD>{formatDate(item.date)}</TD>
                  <TD>{formatTime(item.startTime)}</TD>
                  <TD>
                    <Badge tone={item.status === "CONFIRMED" ? "primary" : item.status === "PENDING" ? "warning" : "muted"}>
                      {statusLabel[item.status]}
                    </Badge>
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

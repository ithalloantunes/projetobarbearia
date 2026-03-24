"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { Button, Panel, Select, StatCard } from "@/components/ui";

type ReportPeriod = "7d" | "30d" | "90d" | "12m";

type ReportsPayload = {
  period: ReportPeriod;
  summary: {
    totalAppointments: number;
    noShowCount: number;
    canceledCount: number;
    completedCount: number;
    confirmedCount: number;
    revenue: number;
    projectedRevenue: number;
    averageTicket: number;
    retentionRate: number;
  };
  topServices: Array<{ name: string; count: number; revenue: number }>;
  teamPerformance: Array<{ name: string; count: number; revenue: number; rating: number; reviews: number }>;
  monthlyRevenue: Array<{ key: string; label: string; value: number }>;
  exportRowsCount: number;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminRelatoriosPage() {
  const [period, setPeriod] = useState<ReportPeriod>("30d");
  const [reports, setReports] = useState<ReportsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/reports?period=${period}`);
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
  }, [period]);

  const maxMonthly = useMemo(
    () => Math.max(...(reports?.monthlyRevenue ?? []).map((item) => item.value), 1),
    [reports?.monthlyRevenue]
  );

  return (
    <AdminShell
      title="Relatorios executivos"
      subtitle="Leitura de performance, projecao de receita e retencao de clientes."
      actions={
        <div className="flex items-center gap-2">
          <Select value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)} className="w-32">
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
            <option value="12m">12 meses</option>
          </Select>
          <a href={`/api/admin/reports?period=${period}&format=csv`} target="_blank" rel="noreferrer">
            <Button intent="secondary" size="sm">
              Exportar CSV
            </Button>
          </a>
        </div>
      }
    >
      {error ? <p className="text-sm text-error">{error}</p> : null}

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Receita" value={loading ? "..." : formatBRL(reports?.summary.revenue ?? 0)} />
        <StatCard
          label="Projetado"
          value={loading ? "..." : formatBRL(reports?.summary.projectedRevenue ?? 0)}
          helper="Forecast do periodo"
        />
        <StatCard label="Ticket medio" value={loading ? "..." : formatBRL(reports?.summary.averageTicket ?? 0)} />
        <StatCard label="Retencao" value={loading ? "..." : `${reports?.summary.retentionRate ?? 0}%`} />
        <StatCard label="No-show" value={loading ? "..." : reports?.summary.noShowCount ?? 0} />
        <StatCard label="Dataset" value={loading ? "..." : reports?.exportRowsCount ?? 0} helper="linhas exportaveis" />
      </section>

      <Panel title="Receita mensal" className="mt-4">
        <div className="grid h-44 grid-cols-6 items-end gap-2">
          {(reports?.monthlyRevenue ?? []).map((item) => {
            const height = Math.max((item.value / maxMonthly) * 100, item.value > 0 ? 8 : 3);
            return (
              <div key={item.key} className="flex flex-col items-center gap-2">
                <div className="w-full rounded-t-md atelier-gradient" style={{ height: `${height}%` }} />
                <span className="text-[11px] font-semibold text-foreground-muted">{item.label}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top servicos">
          <div className="space-y-2">
            {(reports?.topServices ?? []).map((service) => (
              <div key={service.name} className="atelier-surface flex items-center justify-between p-3 text-sm">
                <div>
                  <p className="font-semibold">{service.name}</p>
                  <p className="text-xs text-foreground-muted">{service.count} atendimentos</p>
                </div>
                <p className="font-semibold text-primary">{formatBRL(service.revenue)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Performance da equipe">
          <div className="space-y-2">
            {(reports?.teamPerformance ?? []).map((barber) => (
              <div key={barber.name} className="atelier-surface flex items-center justify-between p-3 text-sm">
                <div>
                  <p className="font-semibold">{barber.name}</p>
                  <p className="text-xs text-foreground-muted">
                    {barber.count} atendimentos • {barber.reviews} reviews
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{formatBRL(barber.revenue)}</p>
                  <p className="text-xs text-foreground-muted">Rating {barber.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </AdminShell>
  );
}

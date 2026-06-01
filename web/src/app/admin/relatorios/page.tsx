"use client";

import { useEffect, useId, useMemo, useState } from "react";
import AdminShell from "@/components/admin-shell";
import { Button, Panel, Select, StatCard } from "@/components/ui";

type ReportPeriod = "7d" | "30d" | "90d" | "12m";
type RevenueSeriesKind = "daily" | "weekly" | "monthly";

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
  revenueSeriesKind: RevenueSeriesKind;
  revenueSeries: Array<{ key: string; label: string; value: number }>;
  exportRowsCount: number;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatBRLCompact(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1
  });
}

export default function AdminRelatoriosPage() {
  const [period, setPeriod] = useState<ReportPeriod>("30d");
  const [reports, setReports] = useState<ReportsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gradientId = useId().replace(/:/g, "");

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

  const maxSeries = useMemo(
    () => Math.max(...(reports?.revenueSeries ?? []).map((item) => item.value), 1),
    [reports?.revenueSeries]
  );

  const chartTitle = useMemo(() => {
    if (reports?.revenueSeriesKind === "daily") return "Receita diaria";
    if (reports?.revenueSeriesKind === "weekly") return "Receita semanal";
    return "Receita mensal";
  }, [reports?.revenueSeriesKind]);

  const revenueLineChart = useMemo(() => {
    const points = reports?.revenueSeries ?? [];

    const chartWidth = 700;
    const chartHeight = 260;
    const yAxisLabelWidth = 64;
    const paddingX = yAxisLabelWidth + 8;
    const paddingTop = 20;
    const paddingBottom = 38;

    const innerWidth = chartWidth - paddingX * 2;
    const innerHeight = chartHeight - paddingTop - paddingBottom;

    const normalizeXBy = Math.max(points.length - 1, 1);
    const normalizeYBy = Math.max(maxSeries, 1);

    const plotPoints = points.map((point, index) => {
      const x = paddingX + (index / normalizeXBy) * innerWidth;
      const y = paddingTop + (1 - point.value / normalizeYBy) * innerHeight;
      return { ...point, x, y };
    });

    const linePath =
      plotPoints.length > 0
        ? plotPoints
            .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
            .join(" ")
        : "";

    const baselineY = paddingTop + innerHeight;
    const areaPath =
      plotPoints.length > 0
        ? [
            `M ${plotPoints[0].x.toFixed(2)} ${baselineY.toFixed(2)}`,
            ...plotPoints.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`),
            `L ${plotPoints[plotPoints.length - 1].x.toFixed(2)} ${baselineY.toFixed(2)}`,
            "Z"
          ].join(" ")
        : "";

    const yTicks = Array.from({ length: 4 }, (_, index) => {
      const ratio = index / 3;
      const y = paddingTop + ratio * innerHeight;
      const value = maxSeries * (1 - ratio);
      return {
        y,
        label: formatBRLCompact(value)
      };
    });

    const labelStep =
      points.length <= 8 ? 1 : points.length <= 16 ? 2 : points.length <= 32 ? 4 : points.length <= 52 ? 6 : 8;

    return {
      chartWidth,
      chartHeight,
      paddingX,
      plotPoints,
      linePath,
      areaPath,
      yTicks,
      labelStep
    };
  }, [maxSeries, reports?.revenueSeries]);

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

      <Panel title={chartTitle} className="mt-4">
        <div className="h-64 w-full">
          <svg
            viewBox={`0 0 ${revenueLineChart.chartWidth} ${revenueLineChart.chartHeight}`}
            className="h-full w-full"
            role="img"
            aria-label={`Grafico de linha da ${chartTitle.toLowerCase()}`}
          >
            <defs>
              <linearGradient id={`${gradientId}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0.55" />
                <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id={`${gradientId}-area`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0.26" />
                <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {revenueLineChart.yTicks.map((tick, index) => (
              <g key={`${tick.label}-${index}`}>
                <line
                  x1={revenueLineChart.paddingX}
                  y1={tick.y}
                  x2={revenueLineChart.chartWidth - revenueLineChart.paddingX}
                  y2={tick.y}
                  stroke="rgb(var(--color-outline-variant))"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <text x={6} y={tick.y + 4} fontSize="11" fill="rgba(255,255,255,0.92)">
                  {tick.label}
                </text>
              </g>
            ))}

            {revenueLineChart.areaPath ? (
              <path d={revenueLineChart.areaPath} fill={`url(#${gradientId}-area)`} />
            ) : null}
            {revenueLineChart.linePath ? (
              <path
                d={revenueLineChart.linePath}
                fill="none"
                stroke={`url(#${gradientId}-line)`}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {revenueLineChart.plotPoints.map((point) => (
              <g key={point.key}>
                <circle cx={point.x} cy={point.y} r="4.5" fill="rgb(var(--color-primary))" />
                <circle cx={point.x} cy={point.y} r="8" fill="rgb(var(--color-primary))" fillOpacity="0.2" />
                <title>{`${point.label}: ${formatBRL(point.value)}`}</title>
              </g>
            ))}
          </svg>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {(reports?.revenueSeries ?? []).map((item, index, list) => (
            <span key={item.key} className="flex-1 text-center text-[11px] font-semibold text-foreground-muted">
              {index % revenueLineChart.labelStep === 0 || index === list.length - 1 ? item.label : " "}
            </span>
          ))}
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

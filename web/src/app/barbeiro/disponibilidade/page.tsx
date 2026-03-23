"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/logout-button";

type SessionPayload = {
  user: { role: "CLIENT" | "BARBER" | "ADMIN" };
  barberId: number | null;
};

type Barber = { id: number; name: string };

type AvailabilityItem = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type DayConfig = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

const days = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terca" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sabado" }
];

function defaultConfig(): Record<number, DayConfig> {
  return {
    0: { enabled: false, startTime: "09:00", endTime: "18:00" },
    1: { enabled: true, startTime: "09:00", endTime: "20:00" },
    2: { enabled: true, startTime: "09:00", endTime: "20:00" },
    3: { enabled: true, startTime: "09:00", endTime: "20:00" },
    4: { enabled: true, startTime: "09:00", endTime: "20:00" },
    5: { enabled: true, startTime: "09:00", endTime: "20:00" },
    6: { enabled: true, startTime: "08:00", endTime: "18:00" }
  };
}

function timeLabel(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export default function BarbeiroDisponibilidadePage() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [config, setConfig] = useState<Record<number, DayConfig>>(defaultConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      setLoading(true);
      setError(null);
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok) {
          throw new Error(sessionData.error || "Falha ao carregar sessao.");
        }
        if (!mounted) return;
        setSession(sessionData);

        if (sessionData.user.role === "ADMIN") {
          const barbersRes = await fetch("/api/barbers");
          const barbersData = await barbersRes.json();
          if (!barbersRes.ok) {
            throw new Error(barbersData.error || "Falha ao carregar barbeiros.");
          }
          if (!mounted) return;
          setBarbers(barbersData.barbers ?? []);
          setSelectedBarberId(barbersData.barbers?.[0]?.id ?? null);
        } else {
          setSelectedBarberId(sessionData.barberId);
        }
      } catch (bootstrapError) {
        if (!mounted) return;
        const messageText = bootstrapError instanceof Error ? bootstrapError.message : "Falha ao iniciar tela.";
        setError(messageText);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBarberId) return;
    let mounted = true;
    async function loadAvailability() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/barber/availability?barberId=${selectedBarberId}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Falha ao carregar disponibilidade.");
        }
        if (!mounted) return;

        const nextConfig = defaultConfig();
        (payload.availability as AvailabilityItem[]).forEach((item) => {
          nextConfig[item.dayOfWeek] = {
            enabled: true,
            startTime: timeLabel(item.startTime),
            endTime: timeLabel(item.endTime)
          };
        });
        setConfig(nextConfig);
      } catch (loadError) {
        if (!mounted) return;
        const messageText = loadError instanceof Error ? loadError.message : "Falha ao carregar disponibilidade.";
        setError(messageText);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAvailability();
    return () => {
      mounted = false;
    };
  }, [selectedBarberId]);

  async function saveDay(dayOfWeek: number) {
    if (!selectedBarberId) return;
    const dayConfig = config[dayOfWeek];
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/barber/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: selectedBarberId,
          dayOfWeek,
          ranges: dayConfig.enabled
            ? [{ startTime: dayConfig.startTime, endTime: dayConfig.endTime }]
            : []
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao salvar disponibilidade.");
      }
      setMessage(`Disponibilidade de ${days.find((day) => day.value === dayOfWeek)?.label} salva.`);
    } catch (saveError) {
      const messageText = saveError instanceof Error ? saveError.message : "Falha ao salvar disponibilidade.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <header className="rounded-2xl border border-primary/20 bg-white dark:bg-white/5 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-primary font-bold">Painel barbeiro</p>
            <h1 className="text-2xl font-black tracking-tight mt-1">Disponibilidade semanal</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/barbeiro" className="px-3 py-2 rounded-xl border border-primary/20 text-sm font-bold hover:bg-primary/10">
              Voltar agenda
            </Link>
            <LogoutButton className="px-3 py-2 rounded-xl border border-primary/20 text-sm font-bold hover:bg-primary/10" />
          </div>
        </header>

        {session?.user.role === "ADMIN" ? (
          <section className="mt-4 rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-4">
            <label className="text-sm">
              <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Barbeiro</span>
              <select
                className="rounded-xl border border-primary/20 bg-transparent px-3 py-2 text-sm"
                value={selectedBarberId ?? ""}
                onChange={(event) => setSelectedBarberId(Number(event.target.value))}
              >
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </label>
          </section>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-emerald-500">{message}</p> : null}

        <section className="mt-4 rounded-2xl border border-primary/10 bg-white dark:bg-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-primary/10">
              <tr>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Dia</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Ativo</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Inicio</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Fim</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-slate-500">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-sm text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : (
                days.map((day) => (
                  <tr key={day.value}>
                    <td className="px-4 py-3 text-sm font-medium">{day.label}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={config[day.value]?.enabled ?? false}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            [day.value]: {
                              ...prev[day.value],
                              enabled: event.target.checked
                            }
                          }))
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        className="rounded-lg border border-primary/20 bg-transparent px-2 py-1 text-sm"
                        value={config[day.value]?.startTime ?? "09:00"}
                        disabled={!config[day.value]?.enabled}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            [day.value]: {
                              ...prev[day.value],
                              startTime: event.target.value
                            }
                          }))
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        className="rounded-lg border border-primary/20 bg-transparent px-2 py-1 text-sm"
                        value={config[day.value]?.endTime ?? "18:00"}
                        disabled={!config[day.value]?.enabled}
                        onChange={(event) =>
                          setConfig((prev) => ({
                            ...prev,
                            [day.value]: {
                              ...prev[day.value],
                              endTime: event.target.value
                            }
                          }))
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={saving || !selectedBarberId}
                        onClick={() => saveDay(day.value)}
                        className="px-3 py-1 rounded-lg border border-primary/20 text-xs font-bold hover:bg-primary/10 disabled:opacity-60"
                      >
                        Salvar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

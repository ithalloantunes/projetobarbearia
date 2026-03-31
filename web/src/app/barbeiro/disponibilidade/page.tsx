"use client";

import { useEffect, useMemo, useState } from "react";
import BarberShell from "@/components/shells/barber-shell";
import {
  Button,
  EmptyState,
  Input,
  Panel,
  Select,
  Switch
} from "@/components/ui";

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

type DayRange = {
  startTime: string;
  endTime: string;
};

type DayConfig = {
  enabled: boolean;
  ranges: DayRange[];
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
    0: { enabled: false, ranges: [] },
    1: { enabled: true, ranges: [{ startTime: "09:00", endTime: "20:00" }] },
    2: { enabled: true, ranges: [{ startTime: "09:00", endTime: "20:00" }] },
    3: { enabled: true, ranges: [{ startTime: "09:00", endTime: "20:00" }] },
    4: { enabled: true, ranges: [{ startTime: "09:00", endTime: "20:00" }] },
    5: { enabled: true, ranges: [{ startTime: "09:00", endTime: "20:00" }] },
    6: { enabled: true, ranges: [{ startTime: "08:00", endTime: "18:00" }] }
  };
}

function timeLabel(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function normalizeConfig(config: Record<number, DayConfig>) {
  return JSON.stringify(config);
}

function validateDay(dayConfig: DayConfig) {
  if (!dayConfig.enabled) return null;
  for (const range of dayConfig.ranges) {
    if (toMinutes(range.endTime) <= toMinutes(range.startTime)) {
      return "Horario final deve ser maior que o inicial.";
    }
  }
  const sorted = [...dayConfig.ranges].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
  );
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (toMinutes(current.startTime) < toMinutes(previous.endTime)) {
      return "Existem faixas sobrepostas.";
    }
  }
  return null;
}

export default function BarbeiroDisponibilidadePage() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [config, setConfig] = useState<Record<number, DayConfig>>(defaultConfig());
  const [savedSnapshot, setSavedSnapshot] = useState<string>(normalizeConfig(defaultConfig()));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(() => normalizeConfig(config) !== savedSnapshot, [config, savedSnapshot]);

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
        const grouped = new Map<number, DayRange[]>();
        (payload.availability as AvailabilityItem[]).forEach((item) => {
          const ranges = grouped.get(item.dayOfWeek) ?? [];
          ranges.push({
            startTime: timeLabel(item.startTime),
            endTime: timeLabel(item.endTime)
          });
          grouped.set(item.dayOfWeek, ranges);
        });

        for (const day of days) {
          const ranges = grouped.get(day.value) ?? [];
          nextConfig[day.value] = {
            enabled: ranges.length > 0,
            ranges: ranges.length > 0 ? ranges : nextConfig[day.value].ranges
          };
        }

        setConfig(nextConfig);
        setSavedSnapshot(normalizeConfig(nextConfig));
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

  function updateDay(dayOfWeek: number, updater: (day: DayConfig) => DayConfig) {
    setConfig((previous) => ({
      ...previous,
      [dayOfWeek]: updater(previous[dayOfWeek])
    }));
  }

  function addRange(dayOfWeek: number) {
    updateDay(dayOfWeek, (day) => ({
      ...day,
      enabled: true,
      ranges: [...day.ranges, { startTime: "09:00", endTime: "10:00" }].slice(0, 4)
    }));
  }

  function removeRange(dayOfWeek: number, index: number) {
    updateDay(dayOfWeek, (day) => {
      const nextRanges = day.ranges.filter((_, currentIndex) => currentIndex !== index);
      return {
        ...day,
        enabled: nextRanges.length > 0 ? day.enabled : false,
        ranges: nextRanges
      };
    });
  }

  async function handleSaveAll() {
    if (!selectedBarberId) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      for (const day of days) {
        const dayConfig = config[day.value];
        const issue = validateDay(dayConfig);
        if (issue) {
          throw new Error(`${day.label}: ${issue}`);
        }
      }

      await Promise.all(
        days.map((day) => {
          const dayConfig = config[day.value];
          return fetch("/api/barber/availability", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              barberId: selectedBarberId,
              dayOfWeek: day.value,
              ranges: dayConfig.enabled ? dayConfig.ranges : []
            })
          }).then(async (response) => {
            if (!response.ok) {
              const payload = await response.json();
              throw new Error(payload.error || `Falha ao salvar ${day.label}.`);
            }
          });
        })
      );

      const snapshot = normalizeConfig(config);
      setSavedSnapshot(snapshot);
      setMessage("Disponibilidade semanal salva com sucesso.");
    } catch (saveError) {
      const messageText = saveError instanceof Error ? saveError.message : "Falha ao salvar disponibilidade.";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (!isDirty) return;
    const parsed = JSON.parse(savedSnapshot) as Record<number, DayConfig>;
    setConfig(parsed);
    setMessage("Alteracoes descartadas.");
    setError(null);
  }

  return (
    <BarberShell
      title="Disponibilidade semanal"
      subtitle="Configure multiplas faixas por dia e aplique de uma vez."
      actions={
        session?.user.role === "ADMIN" ? (
          <Select
            value={selectedBarberId ?? ""}
            onChange={(event) => setSelectedBarberId(Number(event.target.value))}
            className="w-48"
          >
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </Select>
        ) : null
      }
    >
      <div className="mt-6 space-y-4">
        {error ? <p className="text-sm text-error">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        {loading ? (
          <Panel>
            <p className="text-sm text-foreground-muted">Carregando disponibilidade...</p>
          </Panel>
        ) : (
          <div className="space-y-3">
            {days.map((day) => {
              const dayConfig = config[day.value];
              return (
                <Panel key={day.value}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">{day.label}</p>
                      <p className="text-sm text-foreground-muted">
                        {dayConfig.enabled ? "Dia ativo para reservas" : "Dia sem atendimento"}
                      </p>
                    </div>
                    <Switch
                      checked={dayConfig.enabled}
                      onChange={(next) =>
                        updateDay(day.value, (prev) => ({
                          ...prev,
                          enabled: next,
                          ranges:
                            next && prev.ranges.length === 0
                              ? [{ startTime: "09:00", endTime: "18:00" }]
                              : prev.ranges
                        }))
                      }
                    />
                  </div>

                  {dayConfig.enabled ? (
                    <div className="mt-4 space-y-2">
                      {dayConfig.ranges.map((range, index) => (
                        <div key={`${day.value}-${index}`} className="flex flex-wrap items-center gap-2">
                          <Input
                            type="time"
                            value={range.startTime}
                            onChange={(event) =>
                              updateDay(day.value, (prev) => ({
                                ...prev,
                                ranges: prev.ranges.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, startTime: event.target.value }
                                    : item
                                )
                              }))
                            }
                            className="w-36"
                          />
                          <span className="text-sm text-foreground-muted">ate</span>
                          <Input
                            type="time"
                            value={range.endTime}
                            onChange={(event) =>
                              updateDay(day.value, (prev) => ({
                                ...prev,
                                ranges: prev.ranges.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, endTime: event.target.value }
                                    : item
                                )
                              }))
                            }
                            className="w-36"
                          />
                          <Button
                            intent="ghost"
                            size="sm"
                            onClick={() => removeRange(day.value, index)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() => addRange(day.value)}
                        disabled={dayConfig.ranges.length >= 4}
                      >
                        Adicionar faixa
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <EmptyState
                        icon="event_busy"
                        title="Dia inativo"
                        description="Ative este dia para abrir horarios de atendimento."
                      />
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>
        )}

        <div className="sticky bottom-2 z-20 rounded-lg border border-outline bg-background-elevated/95 p-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-foreground-muted">
              {isDirty ? "Existem alteracoes nao salvas." : "Tudo salvo."}
            </p>
            <div className="flex items-center gap-2">
              <Button intent="ghost" onClick={handleDiscard} disabled={!isDirty || saving}>
                Descartar
              </Button>
              <Button onClick={handleSaveAll} disabled={!isDirty || saving}>
                {saving ? "Salvando..." : "Salvar semana"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BarberShell>
  );
}

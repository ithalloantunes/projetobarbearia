"use client";

import { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/logout-button";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type Barber = {
  id: number;
  name: string;
  specialty?: string | null;
};

type ViewerRole = "BARBER" | "ADMIN";

type Appointment = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  client: {
    id: number;
    name: string;
  };
  service: {
    id: number;
    name: string;
  };
};

type Block = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
};

type Period = "today" | "tomorrow" | "week";

type AgendaItem =
  | {
      kind: "appointment";
      key: string;
      dateKey: string;
      startMinutes: number;
      appointment: Appointment;
    }
  | {
      kind: "block";
      key: string;
      dateKey: string;
      startMinutes: number;
      block: Block;
    };

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
  NO_SHOW: "No-show"
};

const statusStyles: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 border border-amber-600/20",
  CONFIRMED: "bg-blue-500/10 text-blue-700 border border-blue-600/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 border border-emerald-600/20",
  CANCELED: "bg-red-500/10 text-red-700 border border-red-600/20",
  NO_SHOW: "bg-slate-500/10 text-slate-600 border border-slate-500/20"
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function isoToDateKey(value: string) {
  return value.slice(0, 10);
}

function isoTimeToMinutes(value: string) {
  const time = new Date(value);
  return time.getUTCHours() * 60 + time.getUTCMinutes();
}

function isoTimeToLabel(value: string) {
  const minutes = isoTimeToMinutes(value);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function dateLabel(dateKey: string) {
  const date = fromDateKey(dateKey);
  const label = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function BarbeiroPage() {
  const [viewerRole, setViewerRole] = useState<ViewerRole>("BARBER");
  const [period, setPeriod] = useState<Period>("today");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionItemId, setActionItemId] = useState<number | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockDate, setBlockDate] = useState(toDateKey(new Date()));
  const [blockTime, setBlockTime] = useState("11:30");
  const [blockDuration, setBlockDuration] = useState(30);
  const [blockReason, setBlockReason] = useState("");

  const selectedBarber = barbers.find((barber) => barber.id === selectedBarberId) ?? null;

  const range = useMemo(() => {
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const from = period === "tomorrow" ? addDays(dayStart, 1) : dayStart;
    const to = period === "week" ? addDays(from, 6) : from;
    return {
      fromKey: toDateKey(from),
      toKey: toDateKey(to),
      title:
        period === "today"
          ? "Hoje"
          : period === "tomorrow"
            ? "Amanhã"
            : "Esta Semana"
    };
  }, [period]);

  useEffect(() => {
    setBlockDate(range.fromKey);
  }, [range.fromKey]);

  useEffect(() => {
    let mounted = true;
    const loadBarbers = async () => {
      try {
        const [sessionRes, barbersRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/barbers")
        ]);

        const sessionData = await sessionRes.json();
        if (!sessionRes.ok) {
          throw new Error(sessionData.error || "Nao foi possivel carregar sessao.");
        }

        const barbersData = await barbersRes.json();
        if (!barbersRes.ok) {
          throw new Error(barbersData.error || "Nao foi possivel carregar os barbeiros.");
        }

        if (!mounted) return;
        const loaded: Barber[] = barbersData.barbers ?? [];
        setBarbers(loaded);

        if (sessionData.user?.role === "ADMIN") {
          setViewerRole("ADMIN");
          setSelectedBarberId(loaded[0]?.id ?? null);
        } else {
          setViewerRole("BARBER");
          if (sessionData.barberId) {
            setSelectedBarberId(sessionData.barberId);
          } else if (loaded.length > 0) {
            setSelectedBarberId(loaded[0].id);
          } else {
            setError("Nenhum barbeiro ativo encontrado.");
          }
        }
      } catch (err) {
        if (!mounted) return;
        const errMessage = err instanceof Error ? err.message : "Erro ao carregar agenda.";
        setError(errMessage);
      }
    };

    loadBarbers();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBarberId) return;
    let mounted = true;
    const loadAgenda = async () => {
      setLoading(true);
      setError(null);
      try {
        const appointmentsUrl = `/api/appointments?barberId=${selectedBarberId}&dateFrom=${range.fromKey}&dateTo=${range.toKey}`;
        const blocksUrl = `/api/blocks?barberId=${selectedBarberId}&dateFrom=${range.fromKey}&dateTo=${range.toKey}`;
        const [appointmentsRes, blocksRes] = await Promise.all([
          fetch(appointmentsUrl),
          fetch(blocksUrl)
        ]);

        if (!appointmentsRes.ok || !blocksRes.ok) {
          throw new Error("Falha ao carregar agenda.");
        }

        const appointmentsData = await appointmentsRes.json();
        const blocksData = await blocksRes.json();
        if (!mounted) return;
        setAppointments(appointmentsData.appointments ?? []);
        setBlocks(blocksData.blocks ?? []);
      } catch (err) {
        if (!mounted) return;
        const errMessage = err instanceof Error ? err.message : "Erro ao carregar agenda.";
        setError(errMessage);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAgenda();
    return () => {
      mounted = false;
    };
  }, [selectedBarberId, range.fromKey, range.toKey]);

  const agendaItems = useMemo<AgendaItem[]>(() => {
    const items: AgendaItem[] = [
      ...appointments.map((appointment) => ({
        kind: "appointment" as const,
        key: `appointment-${appointment.id}`,
        dateKey: isoToDateKey(appointment.date),
        startMinutes: isoTimeToMinutes(appointment.startTime),
        appointment
      })),
      ...blocks.map((block) => ({
        kind: "block" as const,
        key: `block-${block.id}`,
        dateKey: isoToDateKey(block.date),
        startMinutes: isoTimeToMinutes(block.startTime),
        block
      }))
    ];

    return items.sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
      return a.startMinutes - b.startMinutes;
    });
  }, [appointments, blocks]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    for (const item of agendaItems) {
      const existing = map.get(item.dateKey) ?? [];
      existing.push(item);
      map.set(item.dateKey, existing);
    }
    return Array.from(map.entries());
  }, [agendaItems]);

  const summary = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((item) => item.status === "COMPLETED").length;
    const pending = appointments.filter((item) =>
      item.status === "PENDING" || item.status === "CONFIRMED"
    ).length;
    return { total, completed, pending, blocks: blocks.length };
  }, [appointments, blocks]);

  async function refreshAgenda() {
    if (!selectedBarberId) return;
    const appointmentsUrl = `/api/appointments?barberId=${selectedBarberId}&dateFrom=${range.fromKey}&dateTo=${range.toKey}`;
    const blocksUrl = `/api/blocks?barberId=${selectedBarberId}&dateFrom=${range.fromKey}&dateTo=${range.toKey}`;
    const [appointmentsRes, blocksRes] = await Promise.all([fetch(appointmentsUrl), fetch(blocksUrl)]);
    const appointmentsData = await appointmentsRes.json();
    const blocksData = await blocksRes.json();
    setAppointments(appointmentsData.appointments ?? []);
    setBlocks(blocksData.blocks ?? []);
  }

  async function handleStatusChange(appointmentId: number, status: AppointmentStatus) {
    setActionItemId(appointmentId);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar status.");
      }
      await refreshAgenda();
      setMessage("Status do atendimento atualizado.");
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Erro ao atualizar status.";
      setError(errMessage);
    } finally {
      setActionItemId(null);
    }
  }

  async function handleCreateBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBarberId) return;

    setActionItemId(-1);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: selectedBarberId,
          date: blockDate,
          time: blockTime,
          durationMinutes: blockDuration,
          reason: blockReason || undefined
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar bloqueio.");
      }
      await refreshAgenda();
      setShowBlockForm(false);
      setBlockReason("");
      setMessage("Horário bloqueado com sucesso.");
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Erro ao criar bloqueio.";
      setError(errMessage);
    } finally {
      setActionItemId(null);
    }
  }

  async function handleDeleteBlock(blockId: number) {
    setActionItemId(blockId);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao remover bloqueio.");
      }
      await refreshAgenda();
      setMessage("Bloqueio removido.");
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Erro ao remover bloqueio.";
      setError(errMessage);
    } finally {
      setActionItemId(null);
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <header className="flex flex-wrap items-center justify-between gap-3 py-6 border-b border-primary/20 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <span className="material-symbols-outlined text-background-dark font-bold">content_cut</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Barber Agenda</h1>
              <p className="text-xs text-slate-500 dark:text-primary/70 font-medium">
                Painel operacional do barbeiro
              </p>
            </div>
          </div>
          <div className="min-w-[220px] flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Profissional</label>
              {viewerRole === "ADMIN" ? (
                <select
                  className="w-full rounded-xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-white/5 px-3 py-2 text-sm"
                  value={selectedBarberId ?? ""}
                  onChange={(event) => setSelectedBarberId(Number(event.target.value))}
                  disabled={barbers.length === 0}
                >
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full rounded-xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-white/5 px-3 py-2 text-sm font-medium">
                  {selectedBarber?.name || "Meu perfil"}
                </div>
              )}
            </div>
            <a
              href="/barbeiro/disponibilidade"
              className="rounded-xl border border-primary/20 px-4 py-2 text-sm font-bold hover:bg-primary/10 transition-colors"
            >
              Horarios
            </a>
            <LogoutButton className="rounded-xl border border-primary/20 px-4 py-2 text-sm font-bold hover:bg-primary/10 transition-colors" />
          </div>
        </header>

        <div className="mb-8">
          <div className="flex border-b border-slate-200 dark:border-primary/10 overflow-x-auto no-scrollbar">
            <button
              className={
                period === "today"
                  ? "flex-1 min-w-[100px] py-4 border-b-2 border-primary text-primary font-bold text-sm"
                  : "flex-1 min-w-[100px] py-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-primary transition-colors"
              }
              onClick={() => setPeriod("today")}
              type="button"
            >
              Hoje
            </button>
            <button
              className={
                period === "tomorrow"
                  ? "flex-1 min-w-[100px] py-4 border-b-2 border-primary text-primary font-bold text-sm"
                  : "flex-1 min-w-[100px] py-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-primary transition-colors"
              }
              onClick={() => setPeriod("tomorrow")}
              type="button"
            >
              Amanhã
            </button>
            <button
              className={
                period === "week"
                  ? "flex-1 min-w-[100px] py-4 border-b-2 border-primary text-primary font-bold text-sm"
                  : "flex-1 min-w-[100px] py-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-primary transition-colors"
              }
              onClick={() => setPeriod("week")}
              type="button"
            >
              Esta Semana
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold leading-tight">{range.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {period === "week"
                ? `${dateLabel(range.fromKey)} até ${dateLabel(range.toKey)}`
                : dateLabel(range.fromKey)}
            </p>
            {selectedBarber ? (
              <p className="text-xs text-primary mt-1">{selectedBarber.name}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setShowBlockForm((current) => !current)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-background-dark font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/10"
          >
            <span className="material-symbols-outlined text-xl">block</span>
            <span>{showBlockForm ? "Fechar Bloqueio" : "Bloquear Horário"}</span>
          </button>
        </div>

        {showBlockForm ? (
          <form
            className="mb-6 rounded-xl border border-primary/20 bg-white dark:bg-white/5 p-4 grid grid-cols-1 md:grid-cols-4 gap-3"
            onSubmit={handleCreateBlock}
          >
            <div>
              <label className="text-xs text-slate-500 block mb-1">Data</label>
              <input
                className="w-full rounded-lg border border-slate-200 dark:border-primary/10 bg-transparent px-3 py-2 text-sm"
                type="date"
                value={blockDate}
                onChange={(event) => setBlockDate(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Hora inicial</label>
              <input
                className="w-full rounded-lg border border-slate-200 dark:border-primary/10 bg-transparent px-3 py-2 text-sm"
                type="time"
                value={blockTime}
                onChange={(event) => setBlockTime(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Duração (min)</label>
              <select
                className="w-full rounded-lg border border-slate-200 dark:border-primary/10 bg-transparent px-3 py-2 text-sm"
                value={blockDuration}
                onChange={(event) => setBlockDuration(Number(event.target.value))}
              >
                <option value={30}>30</option>
                <option value={45}>45</option>
                <option value={60}>60</option>
                <option value={90}>90</option>
                <option value={120}>120</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Motivo</label>
              <input
                className="w-full rounded-lg border border-slate-200 dark:border-primary/10 bg-transparent px-3 py-2 text-sm"
                type="text"
                placeholder="Ex.: Pausa, curso, reunião..."
                value={blockReason}
                onChange={(event) => setBlockReason(event.target.value)}
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background-dark disabled:opacity-60"
                type="submit"
                disabled={actionItemId === -1}
              >
                {actionItemId === -1 ? "Salvando..." : "Confirmar Bloqueio"}
              </button>
            </div>
          </form>
        ) : null}

        {message ? <p className="mb-4 text-sm text-emerald-500">{message}</p> : null}
        {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}

        <div className="space-y-6">
          {loading ? (
            <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-6 text-sm text-slate-500">
              Carregando agenda...
            </div>
          ) : groupedItems.length === 0 ? (
            <div className="rounded-xl border border-primary/10 bg-white dark:bg-white/5 p-6 text-sm text-slate-500">
              Nenhum compromisso encontrado para o período selecionado.
            </div>
          ) : (
            groupedItems.map(([dateKey, items]) => (
              <section key={dateKey}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">{dateLabel(dateKey)}</h3>
                <div className="space-y-3">
                  {items.map((item) => {
                    if (item.kind === "block") {
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between gap-4 p-4 bg-slate-200/50 dark:bg-red-900/5 border border-dashed border-slate-300 dark:border-red-900/20 rounded-xl"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-12 w-12 rounded-full border-2 border-slate-300 dark:border-red-900/20 flex items-center justify-center bg-slate-100 dark:bg-red-900/10">
                              <span className="material-symbols-outlined text-slate-400 dark:text-red-500/70">lock</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-base font-bold text-slate-500 dark:text-red-400/70 leading-none mb-1 italic">
                                Horário Bloqueado
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium">{isoTimeToLabel(item.block.startTime)}</span>
                                <span>até</span>
                                <span className="font-medium">{isoTimeToLabel(item.block.endTime)}</span>
                                <span>•</span>
                                <span>{item.block.reason || "Sem motivo informado"}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={actionItemId === item.block.id}
                            onClick={() => handleDeleteBlock(item.block.id)}
                            className="text-xs font-bold text-slate-500 dark:text-slate-400 underline decoration-primary/50 underline-offset-4 hover:text-primary transition-colors disabled:opacity-60"
                          >
                            {actionItemId === item.block.id ? "Removendo..." : "Desbloquear"}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.key}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-12 w-12 rounded-full border-2 border-primary/30 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-background-dark">
                            <span className="material-symbols-outlined text-slate-500">person</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-bold leading-none mb-1 truncate">
                              {item.appointment.client.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-medium text-primary">
                                {isoTimeToLabel(item.appointment.startTime)}
                              </span>
                              <span>•</span>
                              <span className="truncate">{item.appointment.service.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`hidden sm:block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[item.appointment.status]}`}
                          >
                            {statusLabels[item.appointment.status]}
                          </span>
                          <select
                            className="rounded-lg border border-slate-200 dark:border-primary/10 bg-white dark:bg-white/5 px-2.5 py-2 text-xs font-semibold"
                            value={item.appointment.status}
                            onChange={(event) =>
                              handleStatusChange(
                                item.appointment.id,
                                event.target.value as AppointmentStatus
                              )
                            }
                            disabled={actionItemId === item.appointment.id}
                          >
                            <option value="PENDING">Pendente</option>
                            <option value="CONFIRMED">Confirmado</option>
                            <option value="COMPLETED">Concluído</option>
                            <option value="CANCELED">Cancelado</option>
                            <option value="NO_SHOW">No-show</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight">
              Total
            </p>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight">
              Feitos
            </p>
            <p className="text-2xl font-bold text-emerald-500">{summary.completed}</p>
          </div>
          <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight">
              Restam
            </p>
            <p className="text-2xl font-bold text-primary">{summary.pending}</p>
          </div>
          <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight">
              Bloqueios
            </p>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{summary.blocks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}



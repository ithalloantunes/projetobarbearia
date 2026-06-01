"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import BarberShell from "@/components/shells/barber-shell";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Panel,
  Select,
  StatCard
} from "@/components/ui";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
type Barber = { id: number; name: string; specialty?: string | null };
type ViewerRole = "BARBER" | "ADMIN";

type Appointment = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  client: { id: number; name: string };
  service: { id: number; name: string };
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

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL");
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
      title: period === "today" ? "Hoje" : period === "tomorrow" ? "Amanha" : "Esta semana"
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
          throw new Error(barbersData.error || "Nao foi possivel carregar barbeiros.");
        }

        if (!mounted) return;
        const loaded: Barber[] = barbersData.barbers ?? [];
        setBarbers(loaded);

        if (sessionData.user?.role === "ADMIN") {
          setViewerRole("ADMIN");
          setSelectedBarberId(loaded[0]?.id ?? null);
        } else {
          setViewerRole("BARBER");
          setSelectedBarberId(sessionData.barberId ?? loaded[0]?.id ?? null);
        }
      } catch (loadError) {
        if (!mounted) return;
        const errMessage = loadError instanceof Error ? loadError.message : "Erro ao carregar agenda.";
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
      } catch (loadError) {
        if (!mounted) return;
        const errMessage = loadError instanceof Error ? loadError.message : "Erro ao carregar agenda.";
        setError(errMessage);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAgenda();
    return () => {
      mounted = false;
    };
  }, [selectedBarberId, range.fromKey, range.toKey]);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (!query) return true;
      return (
        item.client.name.toLowerCase().includes(query) ||
        item.service.name.toLowerCase().includes(query)
      );
    });
  }, [appointments, search, statusFilter]);

  const agendaItems = useMemo<AgendaItem[]>(() => {
    const items: AgendaItem[] = [
      ...filteredAppointments.map((appointment) => ({
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
  }, [filteredAppointments, blocks]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    for (const item of agendaItems) {
      const current = map.get(item.dateKey) ?? [];
      current.push(item);
      map.set(item.dateKey, current);
    }
    return Array.from(map.entries());
  }, [agendaItems]);

  const summary = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((item) => item.status === "COMPLETED").length;
    const inService = appointments.filter((item) => item.status === "CONFIRMED").length;
    const pending = appointments.filter((item) => item.status === "PENDING").length;
    return { total, completed, inService, pending, blocks: blocks.length };
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
    } catch (updateError) {
      const errMessage = updateError instanceof Error ? updateError.message : "Erro ao atualizar status.";
      setError(errMessage);
    } finally {
      setActionItemId(null);
    }
  }

  async function handleCreateBlock(event: FormEvent<HTMLFormElement>) {
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
      setMessage("Horario bloqueado com sucesso.");
    } catch (createError) {
      const errMessage = createError instanceof Error ? createError.message : "Erro ao criar bloqueio.";
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
    } catch (deleteError) {
      const errMessage = deleteError instanceof Error ? deleteError.message : "Erro ao remover bloqueio.";
      setError(errMessage);
    } finally {
      setActionItemId(null);
    }
  }

  return (
    <BarberShell
      title="Agenda operacional"
      subtitle="Timeline, status e bloqueios com foco em execucao rapida."
      actions={
        <Button onClick={() => setShowBlockForm((state) => !state)} size="sm">
          <span className="material-symbols-outlined text-base">block</span>
          {showBlockForm ? "Fechar bloqueio" : "Bloquear horario"}
        </Button>
      }
    >
      <div className="mt-6 space-y-5">
        <Panel>
          <div className="grid gap-3 md:grid-cols-[1fr,200px,180px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cliente ou servico..."
            />
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | "ALL")}
            >
              <option value="ALL">Todos os status</option>
              <option value="PENDING">Pendente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="COMPLETED">Concluido</option>
              <option value="CANCELED">Cancelado</option>
              <option value="NO_SHOW">No-show</option>
            </Select>
            <Select value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
              <option value="today">Hoje</option>
              <option value="tomorrow">Amanha</option>
              <option value="week">Esta semana</option>
            </Select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {viewerRole === "ADMIN" ? (
              <Select
                value={selectedBarberId ?? ""}
                onChange={(event) => setSelectedBarberId(Number(event.target.value))}
                className="w-52"
              >
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </Select>
            ) : (
              <Badge tone="primary">{selectedBarber?.name || "Meu perfil"}</Badge>
            )}
            <Badge tone="muted">{range.title}</Badge>
          </div>
        </Panel>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total" value={summary.total} />
          <StatCard label="Pendentes" value={summary.pending} />
          <StatCard label="Confirmados" value={summary.inService} />
          <StatCard label="Concluidos" value={summary.completed} />
          <StatCard label="Bloqueios" value={summary.blocks} />
        </section>

        {showBlockForm ? (
          <Panel title="Bloquear horario">
            <form className="grid gap-3 md:grid-cols-4" onSubmit={handleCreateBlock}>
              <Input type="date" value={blockDate} onChange={(event) => setBlockDate(event.target.value)} required />
              <Input type="time" value={blockTime} onChange={(event) => setBlockTime(event.target.value)} required />
              <Select value={String(blockDuration)} onChange={(event) => setBlockDuration(Number(event.target.value))}>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
              </Select>
              <Input
                type="text"
                value={blockReason}
                onChange={(event) => setBlockReason(event.target.value)}
                placeholder="Motivo"
              />
              <div className="md:col-span-4">
                <Button type="submit" disabled={actionItemId === -1}>
                  {actionItemId === -1 ? "Salvando..." : "Confirmar bloqueio"}
                </Button>
              </div>
            </form>
          </Panel>
        ) : null}

        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-error">{error}</p> : null}

        {loading ? (
          <Panel>
            <p className="text-sm text-foreground-muted">Carregando agenda...</p>
          </Panel>
        ) : groupedItems.length === 0 ? (
          <EmptyState
            icon="calendar_today"
            title="Agenda vazia"
            description="Nenhum compromisso encontrado para o periodo selecionado."
          />
        ) : (
          groupedItems.map(([dateKey, items]) => (
            <Panel key={dateKey} title={dateLabel(dateKey)}>
              <div className="space-y-3">
                {items.map((item) => {
                  if (item.kind === "block") {
                    return (
                      <div
                        key={item.key}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-error/25 bg-error/10 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-error">Horario bloqueado</p>
                          <p className="text-xs text-foreground-muted">
                            {isoTimeToLabel(item.block.startTime)} - {isoTimeToLabel(item.block.endTime)}
                            {item.block.reason ? ` • ${item.block.reason}` : ""}
                          </p>
                        </div>
                        <Button
                          intent="danger"
                          size="sm"
                          onClick={() => handleDeleteBlock(item.block.id)}
                          disabled={actionItemId === item.block.id}
                        >
                          {actionItemId === item.block.id ? "Removendo..." : "Desbloquear"}
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.key}
                      className="grid gap-3 rounded-md border border-outline-variant bg-surface-soft/50 px-3 py-3 md:grid-cols-[1fr,220px]"
                    >
                      <div>
                        <p className="text-sm font-semibold">{item.appointment.client.name}</p>
                        <p className="text-xs text-foreground-muted">
                          {item.appointment.service.name} • {isoTimeToLabel(item.appointment.startTime)}
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Badge tone={statusTone[item.appointment.status]}>
                          {statusLabels[item.appointment.status]}
                        </Badge>
                        <Select
                          value={item.appointment.status}
                          onChange={(event) =>
                            handleStatusChange(
                              item.appointment.id,
                              event.target.value as AppointmentStatus
                            )
                          }
                          className="w-36"
                          disabled={actionItemId === item.appointment.id}
                        >
                          <option value="PENDING">Pendente</option>
                          <option value="CONFIRMED">Confirmado</option>
                          <option value="COMPLETED">Concluido</option>
                          <option value="CANCELED">Cancelado</option>
                          <option value="NO_SHOW">No-show</option>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          ))
        )}
      </div>
    </BarberShell>
  );
}

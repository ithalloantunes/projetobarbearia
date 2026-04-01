"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/logout-button";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Panel,
  SectionHeader
} from "@/components/ui";
import { toDateKey } from "@/lib/time";
import { cn } from "@/lib/cn";

type Service = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number | string;
  durationMinutes: number;
};

type Barber = {
  id: number;
  name: string;
  level?: string;
  image?: string;
};

type UserRole = "CLIENT" | "BARBER" | "ADMIN";
type AppointmentBarber = Barber | { id: "any"; name: string; level: string };

const ANY_BARBER_OPTION: AppointmentBarber = {
  id: "any",
  name: "Qualquer um",
  level: "Disponivel"
};

const steps = [
  { id: 1, title: "Servico" },
  { id: 2, title: "Barbeiro" },
  { id: 3, title: "Data e hora" },
  { id: 4, title: "Confirmacao" }
];

function normalizeLookup(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatPrice(value: number | string) {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) {
    return "-";
  }
  return numeric.toFixed(2).replace(".", ",");
}

function formatDateLong(date: Date) {
  const formatted = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short"
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(".", "");
}

export default function AgendarPage() {
  const [userRole, setUserRole] = useState<UserRole>("CLIENT");
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<number | "any" | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [adminClientEmail, setAdminClientEmail] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefillNotice, setPrefillNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, index) => {
      const next = new Date(today);
      next.setDate(today.getDate() + index);
      return next;
    });
  }, []);

  const selectedDate = dates[selectedDateIndex];
  const selectedService = services.find((service) => service.id === selectedServiceId) ?? null;

  const barbersWithAny = useMemo<AppointmentBarber[]>(
    () => (barbers.length > 0 ? [...barbers, ANY_BARBER_OPTION] : []),
    [barbers]
  );

  const selectedBarber =
    barbersWithAny.find((barber) => barber.id === selectedBarberId) ?? null;

  const effectiveBarber = useMemo<Barber | null>(() => {
    if (!selectedBarber) {
      return null;
    }
    if (selectedBarber.id === "any") {
      return barbers[0] ?? null;
    }
    return selectedBarber;
  }, [barbers, selectedBarber]);

  useEffect(() => {
    let mounted = true;

    async function loadBase() {
      setLoadingBase(true);
      setError(null);

      try {
        const [servicesRes, barbersRes, sessionRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/barbers"),
          fetch("/api/auth/session")
        ]);

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          const role = sessionData?.user?.role;
          if (mounted && (role === "CLIENT" || role === "BARBER" || role === "ADMIN")) {
            setUserRole(role);
          }
        }

        if (!servicesRes.ok || !barbersRes.ok) {
          throw new Error("Nao foi possivel carregar servicos e equipe agora.");
        }

        const servicesData = await servicesRes.json();
        const barbersData = await barbersRes.json();

        const nextServices: Service[] = Array.isArray(servicesData.services)
          ? servicesData.services
          : [];
        const nextBarbers: Barber[] = Array.isArray(barbersData.barbers)
          ? barbersData.barbers.map(
              (barber: { id: number; name: string; specialty?: string | null; photoUrl?: string | null }) => ({
                id: barber.id,
                name: barber.name,
                level: barber.specialty || "Barber",
                image: barber.photoUrl || undefined
              })
            )
          : [];

        if (!mounted) {
          return;
        }

        const query = new URLSearchParams(window.location.search);
        const serviceFromQuery = query.get("service") || query.get("serviceName") || "";
        const barberFromQuery = query.get("barber") || query.get("barberName") || "";
        const normalizedServiceQuery = normalizeLookup(serviceFromQuery);
        const normalizedBarberQuery = normalizeLookup(barberFromQuery);

        const matchedService =
          nextServices.find((service) => {
            const slug = normalizeLookup(service.name);
            return (
              slug === normalizedServiceQuery || String(service.id) === serviceFromQuery.trim()
            );
          }) || null;

        const matchedBarber =
          nextBarbers.find((barber) => {
            const slug = normalizeLookup(barber.name);
            return (
              slug === normalizedBarberQuery || String(barber.id) === barberFromQuery.trim()
            );
          }) || null;

        const nextSelectedServiceId = matchedService?.id ?? nextServices[0]?.id ?? null;
        const nextSelectedBarberId = matchedBarber?.id ?? nextBarbers[0]?.id ?? null;

        setServices(nextServices);
        setBarbers(nextBarbers);
        setSelectedServiceId(nextSelectedServiceId);
        setSelectedBarberId(nextSelectedBarberId);

        if (matchedService && matchedBarber) {
          setCurrentStep(3);
          setPrefillNotice("Selecao inicial aplicada com base na sua escolha da pagina inicial.");
        } else if (matchedService) {
          setCurrentStep(2);
          setPrefillNotice("Servico pre-selecionado. Escolha o barbeiro para continuar.");
        } else if (matchedBarber) {
          setCurrentStep(2);
          setPrefillNotice("Barbeiro pre-selecionado. Revise o servico para continuar.");
        } else {
          setPrefillNotice(null);
        }

        if (nextServices.length === 0) {
          setError("Nenhum servico ativo disponivel para agendamento.");
        } else if (nextBarbers.length === 0) {
          setError("Nenhum barbeiro ativo disponivel para agendamento.");
        }
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        const messageText =
          loadError instanceof Error
            ? loadError.message
            : "Falha ao carregar dados de agendamento.";
        setError(messageText);
      } finally {
        if (mounted) {
          setLoadingBase(false);
        }
      }
    }

    void loadBase();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    async function loadAvailability() {
      if (!selectedService || !effectiveBarber || !selectedDate) {
        setAvailableTimes([]);
        setSelectedTime("");
        return;
      }

      setLoadingAvailability(true);
      try {
        const date = toDateKey(selectedDate);
        const response = await fetch(
          `/api/availability?barberId=${effectiveBarber.id}&serviceId=${selectedService.id}&date=${date}`
        );

        if (!response.ok) {
          throw new Error("Disponibilidade indisponivel.");
        }

        const data = await response.json();
        if (Array.isArray(data.slots)) {
          setAvailableTimes(data.slots);
          setSelectedTime(data.slots[0] || "");
        } else {
          setAvailableTimes([]);
          setSelectedTime("");
        }
      } catch {
        setAvailableTimes([]);
        setSelectedTime("");
      } finally {
        setLoadingAvailability(false);
      }
    }

    void loadAvailability();
  }, [selectedService, effectiveBarber, selectedDate]);

  async function handleSubmit() {
    setError(null);
    setMessage(null);

    if (!selectedService || !effectiveBarber || !selectedTime) {
      setError("Selecione servico, barbeiro, data e horario.");
      return;
    }

    if (userRole === "ADMIN" && !adminClientEmail.trim()) {
      setError("Informe o email do cliente para confirmar o agendamento.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          barberId: effectiveBarber.id,
          serviceId: selectedService.id,
          date: toDateKey(selectedDate),
          time: selectedTime,
          ...(userRole === "ADMIN"
            ? { clientEmail: adminClientEmail.trim().toLowerCase() }
            : {})
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar agendamento.");
      }

      setIsSubmitted(true);
      setMessage("Agendamento confirmado com sucesso.");
    } catch (submitError) {
      const messageText =
        submitError instanceof Error ? submitError.message : "Erro inesperado.";
      setError(messageText);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetWizard() {
    setCurrentStep(1);
    setIsSubmitted(false);
    setMessage(null);
    setError(null);
    setPrefillNotice(null);
    setAdminClientEmail("");
  }

  const canAdvance =
    (currentStep === 1 && Boolean(selectedService)) ||
    (currentStep === 2 && Boolean(selectedBarber)) ||
    (currentStep === 3 && Boolean(selectedTime)) ||
    currentStep === 4;
  const panelPath =
    userRole === "ADMIN" ? "/admin" : userRole === "BARBER" ? "/barbeiro" : "/cliente";
  const appointmentsPath = userRole === "ADMIN" ? "/admin/agenda" : "/cliente";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">content_cut</span>
            <p className="font-display text-xl font-semibold">Atelier Scheduling</p>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={panelPath}>
              <Button intent="ghost" size="sm">
                Painel
              </Button>
            </Link>
            <LogoutButton className="rounded-md border border-outline px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-7 sm:px-6">
        <SectionHeader
          eyebrow="Agendamento"
          title="Reserve seu horario"
          description="Fluxo guiado com resumo em tempo real e disponibilidade dinamica."
        />

        <Panel>
          <div className="grid gap-3 md:grid-cols-4">
            {steps.map((step) => {
              const active = currentStep === step.id;
              const done = currentStep > step.id || (isSubmitted && step.id === 4);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (!isSubmitted) setCurrentStep(step.id);
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left transition-colors",
                    active
                      ? "border-primary/45 bg-primary/14"
                      : "border-outline-variant bg-surface-soft/60",
                    isSubmitted ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Etapa {step.id}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  {done ? <p className="mt-1 text-xs text-success">Concluida</p> : null}
                </button>
              );
            })}
          </div>
        </Panel>

        {isSubmitted ? (
          <Panel className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Reserva confirmada</h2>
            <p className="mt-2 text-sm text-foreground-muted">
              {selectedService?.name ?? "-"} com {effectiveBarber?.name ?? "-"} em{" "}
              {formatDateLong(selectedDate)} as {selectedTime}.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href={appointmentsPath}>
                <Button intent="secondary">Ir para meus agendamentos</Button>
              </Link>
              <Button onClick={resetWizard}>Agendar novo horario</Button>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr,320px] lg:items-start">
            <div className="space-y-4">
              {currentStep === 1 ? (
                <Panel title="Escolha o servico">
                  {loadingBase ? (
                    <p className="text-sm text-foreground-muted">Carregando servicos...</p>
                  ) : services.length === 0 ? (
                    <EmptyState
                      icon="content_cut"
                      title="Sem servicos ativos"
                      description="Ative servicos no painel administrativo para liberar agendamentos."
                    />
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {services.map((service) => {
                        const selected = selectedService?.id === service.id;
                        const serviceImage = service.imageUrl || "/images/placeholder-service.svg";
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => setSelectedServiceId(service.id)}
                            className={cn(
                              "rounded-md border p-4 text-left transition-all",
                              selected
                                ? "border-primary/45 bg-primary/14"
                                : "border-outline-variant bg-surface-soft/60 hover:border-primary/35"
                            )}
                          >
                            <div className="mb-3 overflow-hidden rounded-md border border-outline-variant bg-surface-soft">
                              <img
                                src={serviceImage}
                                alt={`Servico ${service.name}`}
                                className="h-28 w-full object-cover"
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.src = "/images/placeholder-service.svg";
                                }}
                              />
                            </div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-foreground">{service.name}</p>
                                <p className="mt-1 text-sm text-foreground-muted">
                                  {service.description}
                                </p>
                              </div>
                              {selected ? <Badge tone="primary">Selecionado</Badge> : null}
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="font-semibold text-primary">
                                R$ {formatPrice(service.price)}
                              </span>
                              <span className="text-foreground-muted">
                                {service.durationMinutes} min
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              ) : null}

              {currentStep === 2 ? (
                <Panel title="Escolha o barbeiro">
                  {loadingBase ? (
                    <p className="text-sm text-foreground-muted">Carregando equipe...</p>
                  ) : barbersWithAny.length === 0 ? (
                    <EmptyState
                      icon="groups"
                      title="Sem barbeiros ativos"
                      description="Cadastre barbeiros ativos para disponibilizar agendamento."
                    />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {barbersWithAny.map((barber) => {
                        const selected = selectedBarber?.id === barber.id;
                        const barberImage =
                          "image" in barber && barber.image
                            ? barber.image
                            : "/images/placeholder-barber.svg";
                        return (
                          <button
                            key={String(barber.id)}
                            type="button"
                            onClick={() => setSelectedBarberId(barber.id)}
                            className={cn(
                              "rounded-md border p-4 text-left transition-all",
                              selected
                                ? "border-primary/45 bg-primary/14"
                                : "border-outline-variant bg-surface-soft/60 hover:border-primary/35"
                            )}
                          >
                            <div className="mb-3 overflow-hidden rounded-md border border-outline-variant bg-surface-soft">
                              <img
                                src={barberImage}
                                alt={`Barbeiro ${barber.name}`}
                                className="h-28 w-full object-cover"
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.src = "/images/placeholder-barber.svg";
                                }}
                              />
                            </div>
                            <p className="font-semibold text-foreground">{barber.name}</p>
                            <p className="text-sm text-foreground-muted">{barber.level}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              ) : null}

              {currentStep === 3 ? (
                <Panel title="Escolha data e horario">
                  <div className="grid gap-4 md:grid-cols-[1.2fr,1fr]">
                    <div>
                      <p className="atelier-label">Datas disponiveis</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {dates.map((day, index) => {
                          const selected = selectedDateIndex === index;
                          return (
                            <button
                              key={day.toISOString()}
                              type="button"
                              onClick={() => setSelectedDateIndex(index)}
                              className={cn(
                                "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                                selected
                                  ? "border-primary/45 bg-primary/14"
                                  : "border-outline-variant bg-surface-soft/60 hover:border-primary/35"
                              )}
                            >
                              {formatDateLong(day)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="atelier-label">Horarios</p>
                      {loadingAvailability ? (
                        <p className="mt-2 text-sm text-foreground-muted">
                          Buscando horarios...
                        </p>
                      ) : (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {availableTimes.length ? (
                            availableTimes.map((time) => {
                              const selected = selectedTime === time;
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => setSelectedTime(time)}
                                  className={cn(
                                    "rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
                                    selected
                                      ? "border-primary/45 bg-primary/14 text-primary"
                                      : "border-outline-variant bg-surface-soft/60 hover:border-primary/35"
                                  )}
                                >
                                  {time}
                                </button>
                              );
                            })
                          ) : (
                            <div className="col-span-2">
                              <EmptyState
                                icon="event_busy"
                                title="Sem horarios"
                                description="Selecione outra data para encontrar opcoes."
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>
              ) : null}

              {currentStep === 4 ? (
                <Panel title="Confirme sua reserva">
                  <div className="space-y-3 text-sm">
                    <div className="atelier-surface p-3">
                      <p className="atelier-label">Servico</p>
                      <p className="font-semibold text-foreground">{selectedService?.name ?? "-"}</p>
                    </div>
                    <div className="atelier-surface p-3">
                      <p className="atelier-label">Barbeiro</p>
                      <p className="font-semibold text-foreground">{effectiveBarber?.name ?? "-"}</p>
                    </div>
                    <div className="atelier-surface p-3">
                      <p className="atelier-label">Data e horario</p>
                      <p className="font-semibold text-foreground">
                        {formatDateLong(selectedDate)} as {selectedTime || "-"}
                      </p>
                    </div>
                    <div className="atelier-surface p-3">
                      <p className="atelier-label">Total</p>
                      <p className="font-semibold text-primary">
                        R$ {selectedService ? formatPrice(selectedService.price) : "-"} (
                        {selectedService?.durationMinutes ?? "-"} min)
                      </p>
                    </div>
                    {userRole === "ADMIN" ? (
                      <label className="block space-y-1 text-sm">
                        <span className="atelier-label">Email do cliente</span>
                        <Input
                          type="email"
                          placeholder="cliente@exemplo.com"
                          value={adminClientEmail}
                          onChange={(event) => setAdminClientEmail(event.target.value)}
                          required
                        />
                      </label>
                    ) : null}
                  </div>
                </Panel>
              ) : null}

              {error ? <p className="text-sm text-error">{error}</p> : null}
              {prefillNotice ? <p className="text-sm text-primary">{prefillNotice}</p> : null}
              {message ? <p className="text-sm text-success">{message}</p> : null}

              <div className="flex flex-wrap justify-between gap-2">
                <Button
                  intent="ghost"
                  onClick={() => setCurrentStep((value) => Math.max(1, value - 1))}
                  disabled={currentStep === 1}
                >
                  Voltar
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={() => setCurrentStep((value) => Math.min(4, value + 1))}
                    disabled={!canAdvance}
                  >
                    Proxima etapa
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting || !selectedTime}>
                    {isSubmitting ? "Confirmando..." : "Confirmar agendamento"}
                  </Button>
                )}
              </div>
            </div>

            <Panel title="Resumo">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="atelier-label">Servico</p>
                  <p className="font-semibold text-foreground">{selectedService?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="atelier-label">Barbeiro</p>
                  <p className="font-semibold text-foreground">{effectiveBarber?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="atelier-label">Data</p>
                  <p className="font-semibold text-foreground">{formatDateLong(selectedDate)}</p>
                </div>
                <div>
                  <p className="atelier-label">Horario</p>
                  <p className="font-semibold text-foreground">{selectedTime || "-"}</p>
                </div>
                <div className="atelier-divider" />
                <div>
                  <p className="atelier-label">Investimento</p>
                  <p className="text-lg font-semibold text-primary">
                    R$ {selectedService ? formatPrice(selectedService.price) : "-"}
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </main>
    </div>
  );
}

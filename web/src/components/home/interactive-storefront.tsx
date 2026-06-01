"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import { Badge, Button, Panel, SectionHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

type ServiceOption = {
  id: number;
  icon: string;
  name: string;
  description: string;
  price: number | string;
  durationMinutes: number;
  image?: string;
  imageAlt: string;
};

type BarberOption = {
  id: number;
  name: string;
  role: string;
  specialty: string;
  image?: string;
  imageAlt: string;
  serviceIds: number[];
};

type ServicesApiResponse = {
  services?: Array<{
    id: number;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    price: number | string;
    durationMinutes: number;
  }>;
};

type BarbersApiResponse = {
  barbers?: Array<{
    id: number;
    name: string;
    specialty?: string | null;
    photoUrl?: string | null;
    services?: Array<{
      serviceId?: number | null;
      service?: { id?: number | null };
    }>;
  }>;
};

const journeySteps = [
  { id: 1, title: "Escolha o servico" },
  { id: 2, title: "Escolha o barbeiro" },
  { id: 3, title: "Finalize com cadastro" }
];

const indicators = [
  { value: "98%", label: "Satisfacao" },
  { value: "15k+", label: "Atendimentos" },
  { value: "4.9", label: "Avaliacao" }
];

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function normalizeLookup(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveServiceIcon(name: string) {
  const normalized = normalizeLookup(name);

  if (normalized.includes("barba")) return "face";
  if (normalized.includes("sobrancelha")) return "architecture";
  if (normalized.includes("combo")) return "auto_awesome";
  return "content_cut";
}

function formatPrice(value: number | string) {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) {
    return "R$ -";
  }

  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export default function InteractiveStorefront() {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCatalog() {
      setLoadingCatalog(true);
      setCatalogError(null);

      try {
        const [servicesRes, barbersRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/barbers")
        ]);

        if (!servicesRes.ok || !barbersRes.ok) {
          throw new Error("Nao foi possivel carregar os servicos e barbeiros agora.");
        }

        const servicesData = (await servicesRes.json()) as ServicesApiResponse;
        const barbersData = (await barbersRes.json()) as BarbersApiResponse;

        if (!mounted) return;

        const nextServices: ServiceOption[] = Array.isArray(servicesData.services)
          ? servicesData.services.map((service) => ({
              id: service.id,
              icon: resolveServiceIcon(service.name),
              name: service.name,
              description: service.description || "Sem descricao adicional.",
              price: service.price,
              durationMinutes: service.durationMinutes,
              image: service.imageUrl || undefined,
              imageAlt: `Servico ${service.name}`
            }))
          : [];

        const nextBarbers: BarberOption[] = Array.isArray(barbersData.barbers)
          ? barbersData.barbers.map((barber) => ({
              id: barber.id,
              name: barber.name,
              role: barber.specialty || "Barber",
              specialty: barber.specialty || "Especialista em atendimento premium.",
              image: barber.photoUrl || undefined,
              imageAlt: `Foto do barbeiro ${barber.name}`,
              serviceIds: Array.isArray(barber.services)
                ? barber.services
                    .map((entry) => {
                      const rawServiceId = entry.serviceId ?? entry.service?.id ?? null;
                      return typeof rawServiceId === "number" ? rawServiceId : null;
                    })
                    .filter((value): value is number => value !== null)
                : []
            }))
          : [];

        setServices(nextServices);
        setBarbers(nextBarbers);
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error ? error.message : "Falha ao carregar catalogo.";
        setCatalogError(message);
      } finally {
        if (mounted) {
          setLoadingCatalog(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedServices = useMemo(
    () =>
      selectedServiceIds
        .map((serviceId) => services.find((service) => service.id === serviceId) ?? null)
        .filter((service): service is ServiceOption => service !== null),
    [selectedServiceIds, services]
  );

  const primarySelectedService = selectedServices[selectedServices.length - 1] ?? null;

  const availableBarbers = useMemo(() => {
    if (selectedServiceIds.length === 0) {
      return [];
    }

    return barbers.filter((barber) =>
      selectedServiceIds.some((serviceId) => barber.serviceIds.includes(serviceId))
    );
  }, [barbers, selectedServiceIds]);

  useEffect(() => {
    if (!selectedBarberId) {
      return;
    }

    const stillAvailable = availableBarbers.some((barber) => barber.id === selectedBarberId);
    if (!stillAvailable) {
      setSelectedBarberId(null);
    }
  }, [availableBarbers, selectedBarberId]);

  const selectedBarber = useMemo(
    () => availableBarbers.find((barber) => barber.id === selectedBarberId) ?? null,
    [availableBarbers, selectedBarberId]
  );

  const journeyStage = selectedServices.length > 0 ? (selectedBarber ? 3 : 2) : 1;

  const schedulePath = useMemo(() => {
    const params = new URLSearchParams();
    if (primarySelectedService) {
      params.set("service", String(primarySelectedService.id));
      params.set("serviceName", primarySelectedService.name);
    }
    if (selectedServices.length > 0) {
      params.set(
        "services",
        selectedServices.map((service) => String(service.id)).join(",")
      );
      params.set(
        "serviceNames",
        selectedServices.map((service) => service.name).join("|")
      );
    }
    if (selectedBarber) {
      params.set("barber", String(selectedBarber.id));
      params.set("barberName", selectedBarber.name);
    }
    const query = params.toString();
    return query ? `/agendar?${query}` : "/agendar";
  }, [primarySelectedService, selectedBarber, selectedServices]);

  const registerPath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("next", schedulePath);
    if (primarySelectedService) {
      params.set("serviceName", primarySelectedService.name);
    }
    if (selectedServices.length > 0) {
      params.set(
        "serviceNames",
        selectedServices.map((service) => service.name).join("|")
      );
    }
    if (selectedBarber) {
      params.set("barberName", selectedBarber.name);
    }
    return `/cadastrar?${params.toString()}`;
  }, [primarySelectedService, schedulePath, selectedBarber, selectedServices]);

  const loginPath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("next", schedulePath);
    return `/entrar?${params.toString()}`;
  }, [schedulePath]);

  function handleToggleService(serviceId: number) {
    setSelectedServiceIds((previous) => {
      const isSelected = previous.includes(serviceId);
      const next = isSelected
        ? previous.filter((id) => id !== serviceId)
        : [...previous, serviceId];

      if (next.length === 0) {
        setSelectedBarberId(null);
      }

      return next;
    });

    setTimeout(() => {
      scrollToSection("barbeiros");
    }, 120);
  }

  function handleSelectBarber(barberId: number) {
    setSelectedBarberId(barberId);
    setTimeout(() => {
      scrollToSection("jornada");
    }, 120);
  }

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[1.2fr,1fr] lg:items-center">
        <div>
          <p className="atelier-label">The Digital Atelier</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Experiencia de barbearia premium com agendamento em segundos.
          </h1>
          <p className="mt-4 max-w-xl text-base text-foreground-muted">
            Uma jornada completa para clientes, barbeiros e administradores com controle total de agenda,
            equipe e resultados.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={schedulePath}
              className="atelier-gradient inline-flex h-11 items-center justify-center rounded-md border border-primary/40 px-5 text-sm font-bold text-background shadow-atelier transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Agendar agora
            </Link>
            <Button
              intent="secondary"
              size="lg"
              className="transition-transform duration-300 hover:-translate-y-0.5"
              onClick={() => scrollToSection("servicos")}
            >
              Montar meu atendimento
            </Button>
            <Link href={selectedServices.length > 0 && selectedBarber ? registerPath : "/cadastrar"}>
              <Button
                intent="ghost"
                size="lg"
                className="transition-transform duration-300 hover:-translate-y-0.5"
              >
                {selectedServices.length > 0 && selectedBarber ? "Criar conta e concluir" : "Criar conta"}
              </Button>
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone={selectedServices.length > 0 ? "primary" : "muted"}>
              {selectedServices.length > 0
                ? `${selectedServices.length} servico(s) selecionado(s)`
                : "Escolha um servico"}
            </Badge>
            <Badge tone={selectedBarber ? "primary" : "muted"}>
              {selectedBarber ? `Barbeiro: ${selectedBarber.name}` : "Escolha um barbeiro"}
            </Badge>
          </div>
        </div>
        <Panel className="relative w-full overflow-hidden p-0 lg:self-center">
          <div className="absolute inset-0 bg-[url('/images/hero.jpg')] bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]" />
          <div className="relative flex min-h-[240px] items-center p-6 sm:min-h-[280px] lg:min-h-[320px]">
            <div className="max-w-xs space-y-3">
              <p className="text-xs uppercase tracking-editorial">
                <span className="inline-block rounded-sm bg-black/80 px-2 py-px text-primary">
                  Atendimento exclusivo
                </span>
              </p>
              <div className="space-y-1 text-xl font-semibold text-white">
                <span className="block w-fit rounded-sm bg-black/55 px-2 py-0.5">
                  Ambiente sofisticado,
                </span>
                <span className="block w-fit rounded-sm bg-black/55 px-2 py-0.5">
                  tecnologia e precisao em cada
                </span>
                <span className="block w-fit rounded-sm bg-black/55 px-2 py-0.5">detalhe.</span>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      <section id="servicos" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Curadoria"
          title="Servicos mais procurados"
          description="Mostramos todos os servicos ativos. Voce pode selecionar mais de um."
        />
        {loadingCatalog ? (
          <Panel className="mt-6">
            <p className="text-sm text-foreground-muted">Carregando servicos...</p>
          </Panel>
        ) : catalogError ? (
          <Panel className="mt-6">
            <p className="text-sm text-error">{catalogError}</p>
          </Panel>
        ) : services.length === 0 ? (
          <Panel className="mt-6">
            <p className="text-sm text-foreground-muted">Nenhum servico ativo no momento.</p>
          </Panel>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {services.map((service) => {
              const selected = selectedServiceIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleToggleService(service.id)}
                  className={cn(
                    "group h-full rounded-lg text-left transition-all duration-300",
                    selected
                      ? "atelier-panel border-primary/60 shadow-[0_20px_40px_rgba(197,159,89,0.18)]"
                      : "atelier-panel hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_20px_36px_rgba(8,7,5,0.35)]"
                  )}
                >
                  <div className="p-4 sm:p-5">
                    <div className="relative mb-4 overflow-hidden rounded-2xl border border-outline-variant bg-primary/10">
                      <ImageWithFallback
                        src={service.image}
                        alt={service.imageAlt}
                        className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        fallbackSrc="/images/placeholder-service.svg"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-black/70 p-2">
                        <span className="material-symbols-outlined text-sm text-primary">{service.icon}</span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <Badge tone={selected ? "success" : "muted"}>
                          {selected ? "Selecionado" : "Clique para adicionar"}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <p className="mt-2 text-sm text-foreground-muted">{service.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">{formatPrice(service.price)}</span>
                      <span className="text-foreground-muted">{service.durationMinutes} min</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section id="barbeiros" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Equipe"
          title="Barbeiros especialistas"
          description="Passe o mouse para ver o perfil e clique para definir quem vai realizar o atendimento."
        />
        {!selectedServices.length ? (
          <Panel className="mt-6">
            <p className="text-sm text-foreground-muted">
              Primeiro escolha ao menos um servico para liberar a selecao de barbeiros.
            </p>
          </Panel>
        ) : availableBarbers.length === 0 ? (
          <Panel className="mt-6">
            <p className="text-sm text-foreground-muted">
              Nenhum barbeiro disponivel para os servicos selecionados.
            </p>
          </Panel>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {availableBarbers.map((barber) => {
              const selected = selectedBarber?.id === barber.id;
              return (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => handleSelectBarber(barber.id)}
                  className={cn(
                    "group h-full rounded-lg text-left transition-all duration-300",
                    selected
                      ? "atelier-panel border-primary/60 shadow-[0_18px_36px_rgba(197,159,89,0.2)]"
                      : "atelier-panel hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_18px_30px_rgba(8,7,5,0.3)]"
                  )}
                >
                  <div className="p-4 sm:p-5">
                    <div className="relative overflow-hidden rounded-2xl border border-outline-variant">
                      <ImageWithFallback
                        src={barber.image}
                        alt={barber.imageAlt}
                        className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        fallbackSrc="/images/placeholder-barber.svg"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3">
                        <p className="text-sm font-semibold text-white">{barber.role}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold">{barber.name}</h3>
                      {selected ? <Badge tone="success">Selecionado</Badge> : <Badge tone="muted">Selecionar</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-foreground-muted">{barber.specialty}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section id="jornada" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Panel className="grid gap-5 p-6 lg:grid-cols-[1.2fr,1fr]">
          <div>
            <SectionHeader
              eyebrow="Jornada guiada"
              title="Finalize em poucos cliques"
              description="A home agora funciona como uma pre-reserva: escolha, confirme e siga para cadastro."
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {journeySteps.map((step) => {
                const active = journeyStage === step.id;
                const completed = journeyStage > step.id;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "rounded-md border px-3 py-3 transition-all",
                      completed
                        ? "border-success/45 bg-success/10"
                        : active
                          ? "border-primary/45 bg-primary/14"
                          : "border-outline-variant bg-surface-soft/70"
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Etapa {step.id}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{step.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="atelier-surface p-4">
            <p className="atelier-label">Resumo da selecao</p>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="atelier-label">Servico</p>
                {selectedServices.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <Badge key={service.id} tone="primary">
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="font-semibold text-foreground">Nao selecionado</p>
                )}
              </div>
              <div>
                <p className="atelier-label">Barbeiro</p>
                <p className="font-semibold text-foreground">{selectedBarber?.name ?? "Nao selecionado"}</p>
              </div>
              <div className="atelier-divider" />
              <div className="flex flex-wrap gap-2">
                {selectedServices.length > 0 && selectedBarber ? (
                  <>
                    <Link href={registerPath}>
                      <Button className="transition-transform duration-300 hover:-translate-y-0.5">
                        Criar conta e concluir
                      </Button>
                    </Link>
                    <Link href={loginPath}>
                      <Button
                        intent="secondary"
                        className="transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        Ja tenho conta
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    intent="secondary"
                    onClick={() => scrollToSection(selectedServices.length > 0 ? "barbeiros" : "servicos")}
                  >
                    {selectedServices.length > 0 ? "Escolher barbeiro" : "Escolher servico"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Panel>
      </section>

      <section id="clientes" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Panel className="grid gap-6 p-6 md:grid-cols-[1.1fr,1fr] md:items-center">
          <div>
            <p className="atelier-label">Depoimento</p>
            <h3 className="mt-2 text-2xl font-semibold">"A melhor experiencia que ja tive em barbearia."</h3>
            <p className="mt-3 text-sm text-foreground-muted">
              Agendamento simples, atendimento pontual e um padrao de acabamento que virou parte da minha rotina.
            </p>
            <p className="mt-4 text-sm font-semibold text-primary">Marcos Oliveira - Cliente recorrente</p>
          </div>
          <div className="space-y-3">
            <p className="atelier-label">Indicadores</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {indicators.map((indicator) => (
                <button
                  key={indicator.label}
                  type="button"
                  className="atelier-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10"
                >
                  <p className="text-2xl font-bold text-primary">{indicator.value}</p>
                  <p className="text-xs text-foreground-muted">{indicator.label}</p>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </section>

      <section id="contato" className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6">
        <Panel className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="atelier-label">Contato</p>
            <p className="mt-1 text-sm text-foreground-muted">Av. Paulista, 1000 - Sao Paulo/SP</p>
            <p className="text-sm text-foreground-muted">(11) 99999-9999 - contato@barbersaas.com</p>
            <p className="mt-2 text-xs text-foreground-muted">
              <Link href="/termos-de-uso" className="font-semibold text-primary hover:underline">
                Termos de uso
              </Link>{" "}
              e{" "}
              <Link href="/politica-privacidade" className="font-semibold text-primary hover:underline">
                politica de privacidade
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={selectedServices.length > 0 && selectedBarber ? registerPath : "/cadastrar"}>
              <Button size="lg" className="transition-transform duration-300 hover:-translate-y-0.5">
                {selectedServices.length > 0 && selectedBarber ? "Concluir com cadastro" : "Criar conta"}
              </Button>
            </Link>
            <Link href={schedulePath}>
              <Button
                intent="secondary"
                size="lg"
                className="transition-transform duration-300 hover:-translate-y-0.5"
              >
                Quero reservar meu horario
              </Button>
            </Link>
          </div>
        </Panel>
      </section>
    </>
  );
}

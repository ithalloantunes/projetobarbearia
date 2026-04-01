"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import { Badge, Button, Panel, SectionHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

type ServiceOption = {
  id: string;
  icon: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  imageAlt: string;
};

type BarberOption = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  image: string;
  imageAlt: string;
};

const services: ServiceOption[] = [
  {
    id: "corte-premium",
    icon: "content_cut",
    name: "Corte Premium",
    description: "Acabamento tecnico para estilo classico ou moderno.",
    price: "R$ 70",
    duration: "45 min",
    image: "/images/service-corte.jpg",
    imageAlt: "Servico de corte premium"
  },
  {
    id: "barba-atelier",
    icon: "face",
    name: "Barba Atelier",
    description: "Toalha quente, desenho e finalizacao com balm premium.",
    price: "R$ 50",
    duration: "35 min",
    image: "/images/service-barba.jpg",
    imageAlt: "Servico de barba atelier"
  },
  {
    id: "combo-executive",
    icon: "auto_awesome",
    name: "Combo Executive",
    description: "Cabelo + barba + sobrancelha com consultoria de imagem.",
    price: "R$ 130",
    duration: "95 min",
    image: "/images/service-combo.jpg",
    imageAlt: "Servico combo executive"
  }
];

const barbers: BarberOption[] = [
  {
    id: "ricardo-silva",
    name: "Ricardo Silva",
    role: "Master Barber",
    specialty: "Degrade, acabamento classico e atendimento express.",
    image: "/images/barber-ricardo.jpg",
    imageAlt: "Foto do barbeiro Ricardo Silva"
  },
  {
    id: "bruno-santos",
    name: "Bruno Santos",
    role: "Especialista em barba",
    specialty: "Desenho de barba, toalha quente e visagismo.",
    image: "/images/barber-bruno.jpg",
    imageAlt: "Foto do barbeiro Bruno Santos"
  },
  {
    id: "lucas-mendes",
    name: "Lucas Mendes",
    role: "Fade e visagismo",
    specialty: "Low, mid e high fade com consultoria de estilo.",
    image: "/images/barber-lucas.jpg",
    imageAlt: "Foto do barbeiro Lucas Mendes"
  },
  {
    id: "andre-costa",
    name: "Andre Costa",
    role: "Classicos e tesoura",
    specialty: "Cortes classicos, tesoura e acabamento executivo.",
    image: "/images/barber-andre.jpg",
    imageAlt: "Foto do barbeiro Andre Costa"
  }
];

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

export default function InteractiveStorefront() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId]
  );
  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.id === selectedBarberId) ?? null,
    [selectedBarberId]
  );

  const journeyStage = selectedService ? (selectedBarber ? 3 : 2) : 1;

  const schedulePath = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedService) {
      params.set("service", selectedService.id);
      params.set("serviceName", selectedService.name);
    }
    if (selectedBarber) {
      params.set("barber", selectedBarber.id);
      params.set("barberName", selectedBarber.name);
    }
    const query = params.toString();
    return query ? `/agendar?${query}` : "/agendar";
  }, [selectedBarber, selectedService]);

  const registerPath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("next", schedulePath);
    if (selectedService) {
      params.set("serviceName", selectedService.name);
    }
    if (selectedBarber) {
      params.set("barberName", selectedBarber.name);
    }
    return `/cadastrar?${params.toString()}`;
  }, [schedulePath, selectedBarber, selectedService]);

  const loginPath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("next", schedulePath);
    return `/entrar?${params.toString()}`;
  }, [schedulePath]);

  function handleSelectService(serviceId: string) {
    setSelectedServiceId(serviceId);
    setSelectedBarberId(null);
    setTimeout(() => {
      scrollToSection("barbeiros");
    }, 120);
  }

  function handleSelectBarber(barberId: string) {
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
            <Link href={selectedService && selectedBarber ? registerPath : "/cadastrar"}>
              <Button
                intent="ghost"
                size="lg"
                className="transition-transform duration-300 hover:-translate-y-0.5"
              >
                {selectedService && selectedBarber ? "Criar conta e concluir" : "Criar conta"}
              </Button>
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone={selectedService ? "primary" : "muted"}>
              {selectedService ? `Servico: ${selectedService.name}` : "Escolha um servico"}
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
          description="Selecione o servico desejado e continue para escolher o barbeiro ideal."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {services.map((service) => {
            const selected = selectedService?.id === service.id;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleSelectService(service.id)}
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
                        {selected ? "Selecionado" : "Clique para escolher"}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  <p className="mt-2 text-sm text-foreground-muted">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">{service.price}</span>
                    <span className="text-foreground-muted">{service.duration}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section id="barbeiros" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Equipe"
          title="Barbeiros especialistas"
          description="Passe o mouse para ver o perfil e clique para definir quem vai realizar o atendimento."
        />
        {!selectedService ? (
          <Panel className="mt-6">
            <p className="text-sm text-foreground-muted">
              Primeiro escolha um servico para liberar a selecao de barbeiros.
            </p>
          </Panel>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {barbers.map((barber) => {
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
                <p className="font-semibold text-foreground">{selectedService?.name ?? "Nao selecionado"}</p>
              </div>
              <div>
                <p className="atelier-label">Barbeiro</p>
                <p className="font-semibold text-foreground">{selectedBarber?.name ?? "Nao selecionado"}</p>
              </div>
              <div className="atelier-divider" />
              <div className="flex flex-wrap gap-2">
                {selectedService && selectedBarber ? (
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
                    onClick={() => scrollToSection(selectedService ? "barbeiros" : "servicos")}
                  >
                    {selectedService ? "Escolher barbeiro" : "Escolher servico"}
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
            <Link href={selectedService && selectedBarber ? registerPath : "/cadastrar"}>
              <Button size="lg" className="transition-transform duration-300 hover:-translate-y-0.5">
                {selectedService && selectedBarber ? "Concluir com cadastro" : "Criar conta"}
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

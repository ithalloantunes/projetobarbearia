import Link from "next/link";
import type { Metadata } from "next";
import PublicShell from "@/components/shells/public-shell";
import { Button, Panel, SectionHeader } from "@/components/ui";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "BarberSaaS | Agendamento Premium para Barbearias",
  description:
    "Plataforma de agendamento online para clientes, barbeiros e administradores com foco em performance operacional.",
  path: "/"
});

const services = [
  {
    icon: "content_cut",
    name: "Corte Premium",
    description: "Acabamento tecnico para estilo classico ou moderno.",
    price: "R$ 70",
    duration: "45 min"
  },
  {
    icon: "face",
    name: "Barba Atelier",
    description: "Toalha quente, desenho e finalizacao com balm premium.",
    price: "R$ 50",
    duration: "35 min"
  },
  {
    icon: "auto_awesome",
    name: "Combo Executive",
    description: "Cabelo + barba + sobrancelha com consultoria de imagem.",
    price: "R$ 130",
    duration: "95 min"
  }
];

const barbers = [
  { name: "Ricardo Silva", role: "Master Barber" },
  { name: "Bruno Santos", role: "Especialista em barba" },
  { name: "Lucas Mendes", role: "Fade e visagismo" },
  { name: "Andre Costa", role: "Classicos e tesoura" }
];

export default function HomePage() {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[1.25fr,1fr] lg:items-center">
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
            <Link href="/agendar">
              <Button size="lg">Agendar agora</Button>
            </Link>
            <a href="#servicos">
              <Button intent="secondary" size="lg">
                Ver servicos
              </Button>
            </a>
          </div>
        </div>
        <Panel className="overflow-hidden p-0">
          <div className="h-full bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQr7Tor0pG4DNvsuHBVuXQLVj6s_seqvQHE7PcvLq5s6s24sScAbVsUqggro2l5TzYlBcXN_Q1D8NlyU4pnnOpkFGmDVeBBZCH-OqVgoB_OVHIlXNZfKg-nmiTlKJ6CqOPG0UEWr51S_LUehuiYQUH97Al5Ur5_GapXhC5c0ResW9wXqK1JDFJo8BGT3WQ1MLLUcaddqW7Lf86wnaloh6Da-uXSVzuqPGJFfUUn7V0FhPxzkUOsfsQh5lZcPBc0e8c1IXM7_tjApHH')] bg-cover bg-center">
            <div className="h-full bg-gradient-to-b from-black/20 via-black/50 to-black/75 p-6">
              <p className="text-xs uppercase tracking-editorial text-primary">Atendimento exclusivo</p>
              <p className="mt-2 max-w-xs text-xl font-semibold text-white">
                Ambiente sofisticado, tecnologia e precisao em cada detalhe.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section id="servicos" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Curadoria"
          title="Servicos mais procurados"
          description="Pacotes estruturados para rotina semanal, eventos e manutencao da imagem pessoal."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <Panel key={service.name} className="h-full">
              <span className="material-symbols-outlined text-primary">{service.icon}</span>
              <h3 className="mt-3 text-xl font-semibold">{service.name}</h3>
              <p className="mt-2 text-sm text-foreground-muted">{service.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-primary">{service.price}</span>
                <span className="text-foreground-muted">{service.duration}</span>
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section id="barbeiros" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Equipe"
          title="Barbeiros especialistas"
          description="Profissionais treinados para cortes tecnicos, barba e estilo executivo."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {barbers.map((barber) => (
            <Panel key={barber.name} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{barber.name}</h3>
              <p className="text-sm text-foreground-muted">{barber.role}</p>
            </Panel>
          ))}
        </div>
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
          <div className="atelier-surface p-4">
            <p className="atelier-label">Indicadores</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">98%</p>
                <p className="text-xs text-foreground-muted">Satisfacao</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">15k+</p>
                <p className="text-xs text-foreground-muted">Atendimentos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">4.9</p>
                <p className="text-xs text-foreground-muted">Avaliacao</p>
              </div>
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
          <Link href="/agendar">
            <Button size="lg">Quero reservar meu horario</Button>
          </Link>
        </Panel>
      </section>
    </PublicShell>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import PublicShell from "@/components/shells/public-shell";
import { Panel, SectionHeader } from "@/components/ui";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Termos de Uso | BarberSaaS",
  description: "Regras de uso da plataforma BarberSaaS para clientes, barbeiros e administradores.",
  path: "/termos-de-uso"
});

const updatedAt = "25/03/2026";

export default function TermosDeUsoPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Juridico"
          title="Termos de uso"
          description="Documento inicial para uso da plataforma, sujeito a validacao juridica formal antes do go-live publico."
        />
        <Panel className="mt-6 space-y-5 p-6">
          <p className="text-sm text-foreground-muted">Ultima atualizacao: {updatedAt}</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">1. Aceite e escopo</h2>
            <p className="text-sm text-foreground-muted">
              Ao usar o BarberSaaS, voce concorda com estes termos para agendamento, gestao operacional e comunicacoes da barbearia.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">2. Conta e acesso</h2>
            <p className="text-sm text-foreground-muted">
              O usuario e responsavel pela seguranca das credenciais. Contas podem ser bloqueadas em caso de uso indevido, fraude ou violacao de politica.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">3. Agendamentos e cancelamentos</h2>
            <p className="text-sm text-foreground-muted">
              Regras de remarcacao, cancelamento e no-show seguem as politicas configuradas pela barbearia no momento da reserva.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">4. Responsabilidades</h2>
            <p className="text-sm text-foreground-muted">
              O BarberSaaS atua como plataforma de gestao. A prestacao do servico presencial e responsabilidade da barbearia parceira.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">5. Alteracoes e contato</h2>
            <p className="text-sm text-foreground-muted">
              Estes termos podem ser atualizados. Duvudas: <a className="text-primary hover:underline" href="mailto:contato@barbersaas.com">contato@barbersaas.com</a>.
            </p>
          </section>
        </Panel>

        <p className="mt-6 text-sm text-foreground-muted">
          Consulte tambem a{" "}
          <Link href="/politica-privacidade" className="font-semibold text-primary hover:underline">
            politica de privacidade
          </Link>
          .
        </p>
      </section>
    </PublicShell>
  );
}

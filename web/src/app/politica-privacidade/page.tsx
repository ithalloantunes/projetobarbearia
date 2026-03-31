import Link from "next/link";
import type { Metadata } from "next";
import PublicShell from "@/components/shells/public-shell";
import { Panel, SectionHeader } from "@/components/ui";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Politica de Privacidade | BarberSaaS",
  description: "Como dados pessoais sao coletados, usados e protegidos no BarberSaaS.",
  path: "/politica-privacidade"
});

const updatedAt = "25/03/2026";

export default function PoliticaPrivacidadePage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <SectionHeader
          eyebrow="Juridico"
          title="Politica de privacidade"
          description="Documento inicial de tratamento de dados, sujeito a validacao juridica final para go-live publico."
        />
        <Panel className="mt-6 space-y-5 p-6">
          <p className="text-sm text-foreground-muted">Ultima atualizacao: {updatedAt}</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">1. Dados coletados</h2>
            <p className="text-sm text-foreground-muted">
              Coletamos dados de cadastro (nome, email, telefone), dados de autenticacao e dados operacionais de agendamento.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">2. Finalidade de uso</h2>
            <p className="text-sm text-foreground-muted">
              Os dados sao usados para autenticar usuarios, processar reservas, enviar notificacoes e melhorar a experiencia da plataforma.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">3. Compartilhamento e seguranca</h2>
            <p className="text-sm text-foreground-muted">
              Dados sao compartilhados apenas quando necessario para operacao do servico. Medidas tecnicas de protecao sao aplicadas para reduzir riscos de acesso nao autorizado.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">4. Direitos do titular</h2>
            <p className="text-sm text-foreground-muted">
              O titular pode solicitar acesso, correcao e exclusao de dados pessoais, conforme legislacao aplicavel.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">5. Contato</h2>
            <p className="text-sm text-foreground-muted">
              Solicite atendimento sobre dados pessoais pelo email{" "}
              <a className="text-primary hover:underline" href="mailto:privacidade@barbersaas.com">
                privacidade@barbersaas.com
              </a>
              .
            </p>
          </section>
        </Panel>

        <p className="mt-6 text-sm text-foreground-muted">
          Consulte tambem os{" "}
          <Link href="/termos-de-uso" className="font-semibold text-primary hover:underline">
            termos de uso
          </Link>
          .
        </p>
      </section>
    </PublicShell>
  );
}

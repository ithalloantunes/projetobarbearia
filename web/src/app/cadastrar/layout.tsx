import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Criar Conta | BarberSaaS",
  description: "Crie sua conta para agendar servicos e acompanhar seus atendimentos em tempo real.",
  path: "/cadastrar",
  index: false
});

export default function CadastrarLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

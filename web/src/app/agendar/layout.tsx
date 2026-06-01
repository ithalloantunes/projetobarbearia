import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Agendar Atendimento | BarberSaaS",
  description: "Fluxo de reserva com selecao de servico, barbeiro e horario.",
  path: "/agendar",
  index: false
});

export default function AgendarLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

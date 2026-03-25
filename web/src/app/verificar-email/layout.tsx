import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Verificar E-mail | BarberSaaS",
  description: "Ative sua conta para liberar acesso ao agendamento e painel.",
  path: "/verificar-email",
  index: false
});

export default function VerificarEmailLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

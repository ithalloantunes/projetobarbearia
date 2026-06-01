import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Area do Cliente | BarberSaaS",
  description: "Acompanhe seus agendamentos, historico e informacoes de perfil.",
  path: "/cliente",
  index: false
});

export default function ClienteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

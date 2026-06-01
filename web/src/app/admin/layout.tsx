import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Painel Administrativo | BarberSaaS",
  description: "Gestao de agenda, equipe, clientes, servicos e relatorios da barbearia.",
  path: "/admin",
  index: false
});

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

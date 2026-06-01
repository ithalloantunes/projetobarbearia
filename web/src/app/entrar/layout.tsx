import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Entrar | BarberSaaS",
  description: "Acesse sua conta para agendar horarios, acompanhar atendimentos e gerir sua operacao.",
  path: "/entrar",
  index: false
});

export default function EntrarLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

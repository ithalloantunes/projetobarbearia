import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Recuperar Senha | BarberSaaS",
  description: "Solicite um link seguro de recuperacao de senha para voltar ao sistema.",
  path: "/esqueci-senha",
  index: false
});

export default function EsqueciSenhaLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

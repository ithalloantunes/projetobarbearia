import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Redefinir Senha | BarberSaaS",
  description: "Defina uma nova senha forte para proteger sua conta.",
  path: "/redefinir-senha",
  index: false
});

export default function RedefinirSenhaLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

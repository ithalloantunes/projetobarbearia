import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Area do Barbeiro | BarberSaaS",
  description: "Gerencie disponibilidade, agenda e atendimentos do dia.",
  path: "/barbeiro",
  index: false
});

export default function BarbeiroLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

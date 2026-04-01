import type { Metadata } from "next";
import InteractiveStorefront from "@/components/home/interactive-storefront";
import PublicShell from "@/components/shells/public-shell";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "BarberSaaS | Agendamento Premium para Barbearias",
  description:
    "Plataforma de agendamento online para clientes, barbeiros e administradores com foco em performance operacional.",
  path: "/"
});

export default function HomePage() {
  return (
    <PublicShell>
      <InteractiveStorefront />
    </PublicShell>
  );
}

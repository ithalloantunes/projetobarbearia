import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BarberSaaS",
    short_name: "BarberSaaS",
    description: "Sistema de agendamento e gestao para barbearias.",
    start_url: "/",
    display: "standalone",
    background_color: "#171614",
    theme_color: "#171614",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}

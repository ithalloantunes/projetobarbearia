import type { Metadata } from "next";
import "./globals.css";

const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    default: "BarberSaaS",
    template: "%s | BarberSaaS"
  },
  description: "Sistema de agendamento e gestao para barbearias.",
  applicationName: "BarberSaaS",
  keywords: ["barbearia", "agendamento", "saas", "gestao", "barber"],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: appBaseUrl,
    title: "BarberSaaS",
    description: "Sistema de agendamento e gestao para barbearias.",
    siteName: "BarberSaaS"
  },
  twitter: {
    card: "summary_large_image",
    title: "BarberSaaS",
    description: "Sistema de agendamento e gestao para barbearias."
  },
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

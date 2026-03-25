import type { Metadata } from "next";

const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
};

function normalizePath(path: string) {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const path = normalizePath(input.path);
  const shouldIndex = input.index ?? true;

  return {
    metadataBase: new URL(appBaseUrl),
    title: input.title,
    description: input.description,
    alternates: {
      canonical: path
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "BarberSaaS",
      url: `${appBaseUrl}${path}`,
      title: input.title,
      description: input.description
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description
    },
    robots: shouldIndex
      ? {
          index: true,
          follow: true
        }
      : {
          index: false,
          follow: false,
          nocache: true
        }
  };
}

import type { MetadataRoute } from "next";

const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const publicRoutes = [
    "/",
    "/termos-de-uso",
    "/politica-privacidade"
  ];

  return publicRoutes.map((route) => ({
    url: `${appBaseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.6
  }));
}

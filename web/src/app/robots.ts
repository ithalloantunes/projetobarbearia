import type { MetadataRoute } from "next";

const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/entrar", "/cadastrar", "/esqueci-senha", "/redefinir-senha", "/verificar-email"],
        disallow: ["/admin", "/barbeiro", "/cliente", "/api/"]
      }
    ],
    sitemap: `${appBaseUrl}/sitemap.xml`
  };
}

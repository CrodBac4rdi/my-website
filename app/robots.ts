import type { MetadataRoute } from "next";

const SITE_URL = "https://imaginaryops.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nutzer-/Auth-Seiten nicht indexieren (leiten ohnehin auf /login um).
      disallow: ["/profile", "/watchlist", "/lists", "/import", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

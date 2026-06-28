import type { MetadataRoute } from "next";

const SITE_URL = "https://imaginaryops.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1.0, freq: "daily" },
    { path: "/search", priority: 0.7, freq: "weekly" },
    { path: "/calendar", priority: 0.8, freq: "daily" },
    { path: "/backgrounds", priority: 0.5, freq: "weekly" },
    { path: "/legal", priority: 0.3, freq: "yearly" },
    { path: "/login", priority: 0.4, freq: "monthly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}

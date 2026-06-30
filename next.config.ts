import type { NextConfig } from "next";

// Hinweis: Das frühere `next-pwa` (Webpack-Plugin) läuft unter Next 16 + Turbopack
// nicht mehr und wurde entfernt. PWA wird jetzt manuell über public/sw.js +
// app/manifest.ts + components/PWAManager.tsx umgesetzt (siehe Next-PWA-Guide).
const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    // Nur die tatsächlich genutzten Bild-Hosts erlauben (= Moderations-Allowlist).
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
      { protocol: 'https', hostname: 'phrpjjuhwvanqfzcfxxg.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: 'nekos.best', pathname: '/**' },
      { protocol: 'https', hostname: 'api.dicebear.com', pathname: '/**' },
      { protocol: 'https', hostname: 'gravatar.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.gravatar.com', pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        // Service Worker nie cachen, damit Updates sofort greifen.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

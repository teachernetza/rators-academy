import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

// Let the Lovable plugin pick the right Nitro preset:
//  - Inside Lovable's sandbox/published build it forces `cloudflare-module`.
//  - On Vercel, Nitro auto-detects via the `VERCEL=1` env var and emits the
//    Build Output API directory (.vercel/output) automatically.
// Forcing `preset: "vercel"` here broke the Lovable published deploy because
// it stopped emitting the Cloudflare worker, leaving only the raw index.html.
export default defineConfig({
  nitro: true,
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      devOptions: { enabled: false },
      filename: "sw.js",
      manifest: {
        name: "Teacher Netza Varo",
        short_name: "Teacher Netza",
        description: "Plataforma de inglés, cursos, actividades y seguimiento con Teacher Netza.",
        theme_color: "#0f3b4b",
        background_color: "#f7fbfc",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api\//, /^\/~oauth/, /^\/_serverFn/],
        globPatterns: ["**/*.{svg,png,ico,woff2}"],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Never serve HTML from cache first: stale HTML points at hashed
            // JS chunks that no longer exist after a deploy.
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkOnly",
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(?:js|css)$/.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "app-code",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(?:woff2|png|jpg|jpeg|svg|ico|mp3)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});

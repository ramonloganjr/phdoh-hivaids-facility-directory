import { defineConfig, type Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import { VitePWA } from "vite-plugin-pwa";

const nitroPreset = process.env.NITRO_PRESET ?? (process.env.VERCEL ? "vercel" : "node-server");
const usesVercelBuildOutput = nitroPreset === "vercel" || nitroPreset === "vercel-static";

// vite-plugin-pwa predates the Vite environment API and would regenerate the
// service worker after every environment build (client, ssr, nitro). Run its
// build step only after the client build: the precache manifest then lists the
// client assets, and sw.js exists before Nitro builds the server, so the
// node-server preset includes it in the public assets it serves.
function pwaBuildForClientOnly(plugin: Plugin): Plugin {
  if (plugin.name !== "vite-plugin-pwa:build") return plugin;
  return { ...plugin, applyToEnvironment: (environment) => environment.name === "client" };
}

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": `${process.cwd()}/src`,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    nitro({
      preset: nitroPreset,
      output: usesVercelBuildOutput
        ? undefined
        : {
            dir: "dist",
            serverDir: "dist/server",
            publicDir: "dist/client",
          },
    }),
    viteReact(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      strategies: "generateSW",
      filename: "sw.js",
      manifest: false,
      devOptions: { enabled: false },
      // Write sw.js and the workbox runtime into the directory Nitro serves
      // static files from (.vercel/output/static on Vercel, dist/client for
      // node-server) instead of the top-level build.outDir ("dist").
      integration: {
        configureOptions(viteConfig, options) {
          options.outDir = viteConfig.environments.client?.build.outDir ?? options.outDir;
        },
      },
      // Nitro copies public/ into the static output only after the client
      // build, so the workbox glob never sees these; precache them from public/.
      includeAssets: [
        "favicon.ico",
        "favicon*.png",
        "apple-touch-icon.png",
        "manifest.webmanifest",
        "brand/*.svg",
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // SSR app: there is no prebuilt app-shell HTML to precache, and Workbox
        // throws while evaluating the service worker if the fallback URL is not
        // precached. Navigations go through the NetworkFirst "html-pages" rule
        // below instead, which serves visited pages from cache when offline.
        navigateFallback: null,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" &&
              !/^\/(?:api\/|sitemap\.xml|robots\.txt)/.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "html-pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(?:js|css|woff2)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(?:png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }).map(pwaBuildForClientOnly),
  ],
});

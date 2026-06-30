/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "betterlibmanan-icon.ico",
        "betterlibmanan.png",
        "betterlibmanan-extended-logo.png",
      ],
      manifest: {
        name: "BetterLibmanan — Official Portal",
        short_name: "BetterLibmanan",
        description:
          "Official portal of Libmanan, Camarines Sur. Access government services, legislation, and local information.",
        theme_color: "#1e3a8a",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        lang: "en",
        categories: ["government", "public services"],
        icons: [
          {
            src: "/betterlibmanan.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/betterlibmanan.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
        shortcuts: [
          {
            name: "Services",
            short_name: "Services",
            description: "Browse all government services",
            url: "/services",
          },
          {
            name: "Contact",
            short_name: "Contact",
            description: "Get in touch with the LGU",
            url: "/contact",
          },
        ],
      },
      workbox: {
        // 10 MiB — large enough for all real assets; giant outliers excluded via globIgnores
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        globPatterns: ["**/*.{css,html,ico,svg,woff2,js,png}"],
        // Exclude assets that are too large or change too frequently to be worth precaching
        globIgnores: [
          // Hero background image (~2.3 MB) — runtime cached below
          "**/hero-bg-*.png",
          // react-icons bundles all icons into a massive chunk (~9 MB) — exclude from precache
          "**/vendor-icons-*.js",
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Large local images (hero-bg, og-image, etc.) — serve fresh, cache as fallback
            urlPattern: /\/assets\/.*\.png$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "local-images-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Enable SW in dev so you can test the install prompt locally
        enabled: true,
        type: "module",
      },
    }),
  ],
  base: "/",
  // Load .env files from the monorepo root so frontend and backend share
  // a single source of truth. Only variables prefixed with VITE_ are
  // exposed to client code (Vite's default safety boundary).
  envDir: path.resolve(__dirname, "../.."),
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
  build: {
    outDir: "../../build/frontend",
    emptyOutDir: true,
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        // Split vendor libraries into separate cacheable chunks
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "vendor-framer";
            // Do NOT group react-icons — it's 9 MB when bundled together.
            // Let Rollup tree-shake icons per-page instead.
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("react-router")) return "vendor-router";
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/scheduler/")
            )
              return "vendor-react";
            return "vendor";
          }
        },
        // Ensure consistent file naming
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@betterlibmanan/types": path.resolve(
        __dirname,
        "../../packages/types/src",
      ),
      "@betterlibmanan/utils": path.resolve(
        __dirname,
        "../../packages/utils/src",
      ),
    },
  },
  server: {
    port: Number(process.env.VITE_PORT) || 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: Number(process.env.VITE_PORT) || 3000,
  },
});

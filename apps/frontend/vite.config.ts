/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
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
        manualChunks: undefined,
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
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});

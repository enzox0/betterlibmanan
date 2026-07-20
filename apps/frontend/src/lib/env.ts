/**
 * Runtime environment configuration.
 *
 * Vite bakes `import.meta.env.*` values into the JS bundle at build time.
 * This means changing `.env` after a build has no effect — the old values
 * are permanently frozen in the bundle.
 *
 * To solve this, the backend injects a `window.__ENV__` object into
 * `index.html` at request time (populated from the live `process.env`).
 * This file reads from that runtime object first, with `import.meta.env`
 * as a fallback for local dev (where the Vite dev server serves the HTML
 * and no backend injection happens).
 *
 * Priority (highest → lowest):
 *   1. window.__ENV__      — runtime, set by the backend on every request
 *   2. import.meta.env.*   — build-time, only reliable in local dev
 *   3. hard-coded defaults — last resort
 *
 * Usage:
 *   import { runtimeEnv } from "@/lib/env";
 *   const url = runtimeEnv("VITE_SOCKET_URL");
 */

/** Shape of the runtime env object injected by the backend. */
interface RuntimeEnv {
  VITE_SOCKET_URL?: string;
  VITE_API_URL?: string;
  VITE_GOOGLE_MAPS_API_KEY?: string;
  VITE_R2_PUBLIC_BASE_URL?: string;
  VITE_DPWH_PROXY_BASE_URL?: string;
  [key: string]: string | undefined;
}

// Extend the global Window type so TypeScript doesn't complain.
declare global {
  interface Window {
    __ENV__?: RuntimeEnv;
  }
}

/**
 * Read a public environment variable, preferring the runtime-injected value
 * over the build-time baked value.
 */
export function runtimeEnv(key: keyof RuntimeEnv): string {
  // 1. Runtime injection from the backend (production / staging)
  const runtime = window.__ENV__?.[key];
  if (runtime && runtime.trim() !== "") return runtime.trim();

  // 2. Build-time value from Vite (local dev)
  const buildTime = (import.meta.env as Record<string, string | undefined>)[
    key as string
  ];
  if (buildTime && buildTime.trim() !== "") return buildTime.trim();

  // 3. Nothing found
  return "";
}

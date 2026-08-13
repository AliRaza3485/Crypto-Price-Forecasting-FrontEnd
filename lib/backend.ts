// SERVER-ONLY helper. Never import this from a "use client" component —
// it reads BACKEND_URL, which intentionally has no NEXT_PUBLIC_ prefix so
// the raw EC2 IP never reaches the browser bundle.

const TIMEOUT_MS = 10_000;

export interface BackendFetchResult {
  ok: boolean;
  status: number;
  body: unknown;
}

/**
 * Fetches `${BACKEND_URL}${path}` server-side and returns a normalized
 * result. Never throws — network errors, timeouts, and non-JSON bodies are
 * all folded into a `{ ok: false, status, body }` shape so route handlers
 * can just forward it without try/catch boilerplate.
 */
export async function fetchBackend(path: string): Promise<BackendFetchResult> {
  const BACKEND_URL = process.env.BACKEND_URL;

  if (!BACKEND_URL) {
    return {
      ok: false,
      status: 500,
      body: {
        error:
          "BACKEND_URL is not configured on the server. Set it in .env.local (dev) or Vercel Project Settings (prod).",
      },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(`${BACKEND_URL}${path}`, {
      signal: controller.signal,
      cache: "no-store",
    });

    let body: unknown = null;
    try {
      body = await upstream.json();
    } catch {
      // Non-JSON or empty body — leave body as null, status still forwarded.
    }

    return { ok: upstream.ok, status: upstream.status, body };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      status: 504,
      body: {
        error: aborted
          ? "The backend took too long to respond."
          : "Couldn't reach the backend. It may be offline — please try again shortly.",
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

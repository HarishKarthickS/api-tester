import { envMap, interpolate, unresolvedTokens } from "./env";
import type { Environment, HttpMethod, SavedRequest } from "./request";

export type PreparedCall = {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string | undefined;
};

export type CallResult = {
  status: number | null;
  statusText: string;
  ok: boolean;
  ms: number;
  headers: [string, string][];
  bodyText: string;
  error?: string;
};

export function prepareCall(
  req: SavedRequest,
  env: Environment,
): { call: PreparedCall; missing: string[] } {
  const vars = envMap(env.vars);
  const url = interpolate(req.url, vars);
  const headers: Record<string, string> = {};
  const blobs = [req.url, req.body];
  for (const h of req.headers) {
    if (!h.enabled) continue;
    const key = interpolate(h.key, vars).trim();
    const value = interpolate(h.value, vars);
    blobs.push(h.key, h.value);
    if (key) headers[key] = value;
  }
  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : interpolate(req.body, vars);
  if (body) blobs.push(body);
  const missing = unresolvedTokens(blobs.join("\n"), vars);
  return {
    call: { method: req.method, url, headers, body },
    missing,
  };
}

export async function executeCall(call: PreparedCall): Promise<CallResult> {
  const started = performance.now();
  try {
    const init: RequestInit = {
      method: call.method,
      headers: call.headers,
    };
    if (call.body !== undefined && call.method !== "GET" && call.method !== "HEAD") {
      init.body = call.body;
    }
    const res = await fetch(call.url, init);
    const bodyText = await res.text();
    const ms = Math.round(performance.now() - started);
    return {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      ms,
      headers: [...res.headers.entries()],
      bodyText,
    };
  } catch (err) {
    const ms = Math.round(performance.now() - started);
    const message = err instanceof Error ? err.message : "request failed";
    return {
      status: null,
      statusText: "",
      ok: false,
      ms,
      headers: [],
      bodyText: "",
      error: message,
    };
  }
}

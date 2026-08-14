import { createHash } from "crypto";
import type { Request } from "express";
import { clientIp } from "../middleware/spam";

const countryCache = new Map<string, { code: string; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeCountry(code: unknown): string | null {
  if (typeof code !== "string") return null;
  const trimmed = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(trimmed) || trimmed === "XX" || trimmed === "T1") {
    return null;
  }
  return trimmed;
}

function headerCountry(req: Request): string | null {
  const headers = req.headers;
  const candidates = [
    headers["cf-ipcountry"],
    headers["x-vercel-ip-country"],
    headers["x-country-code"],
    headers["cloudfront-viewer-country"],
  ];
  for (const value of candidates) {
    const code = normalizeCountry(Array.isArray(value) ? value[0] : value);
    if (code) return code;
  }
  return null;
}

function ipKey(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

async function lookupCountryByIp(ip: string): Promise<string | null> {
  if (!ip || ip === "unknown" || ip === "::1" || ip.startsWith("127.")) {
    return null;
  }

  const key = ipKey(ip);
  const cached = countryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.code;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`,
      { signal: controller.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { status?: string; countryCode?: string };
    if (data.status !== "success") return null;
    const code = normalizeCountry(data.countryCode);
    if (!code) return null;
    countryCache.set(key, { code, expiresAt: Date.now() + CACHE_TTL_MS });
    return code;
  } catch {
    return null;
  }
}

/** Resolve ISO country code for analytics (never stores raw IP). */
export async function resolveCountry(req: Request): Promise<string> {
  const fromHeader = headerCountry(req);
  if (fromHeader) return fromHeader;

  const ip = clientIp(req);
  const fromIp = await lookupCountryByIp(ip);
  return fromIp || "XX";
}

export function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

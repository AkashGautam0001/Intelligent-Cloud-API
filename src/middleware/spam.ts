import type { NextFunction, Request, Response } from "express";
import { AppError } from "../middleware/error";

type RateEntry = { count: number; resetAt: number };

const hits = new Map<string, RateEntry>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 8;
const MIN_FORM_MS = 2500;

/** Optional content heuristics — reject obvious spam without blocking real leads. */
const URL_RE = /https?:\/\/|www\./gi;
const SPAM_PHRASE_RE =
  /\b(viagra|casino|crypto\s*airdrop|click here now|work from home.*\$\d|seo backlinks|buy followers)\b/i;

export function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function collectText(body: Record<string, unknown>): string {
  const parts = [
    body.message,
    body.notes,
    body.body,
    body.subject,
    body.name,
    body.company,
  ];
  return parts.map((p) => String(p ?? "")).join("\n");
}

function contentLooksSpammy(body: Record<string, unknown>): boolean {
  const text = collectText(body);
  if (!text.trim()) return false;

  const urlMatches = text.match(URL_RE);
  if (urlMatches && urlMatches.length >= 3) return true;
  if (SPAM_PHRASE_RE.test(text)) return true;

  // Excessively long free-text with almost no spaces (bot paste)
  const free = String(body.message ?? body.notes ?? body.body ?? "");
  if (free.length > 2000 && free.split(/\s+/).length < 20) return true;

  return false;
}

/** Honeypot + timing + IP rate limit + light content heuristics for public lead forms. */
export function spamGuard(req: Request, _res: Response, next: NextFunction): void {
  try {
    const body = req.body as Record<string, unknown>;
    const honeypot = String(body.website ?? body.companyUrl ?? body.honeypot ?? "").trim();
    if (honeypot) {
      throw new AppError("Rejected", 400);
    }

    const startedAt = Number(body.formStartedAt ?? body._t ?? 0);
    if (!startedAt || Number.isNaN(startedAt) || Date.now() - startedAt < MIN_FORM_MS) {
      throw new AppError("Please wait a moment and try again", 400);
    }

    if (contentLooksSpammy(body)) {
      throw new AppError("Rejected", 400);
    }

    const ip = clientIp(req);
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || entry.resetAt < now) {
      hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      entry.count += 1;
      if (entry.count > MAX_HITS) {
        throw new AppError("Too many requests. Try again later.", 429);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

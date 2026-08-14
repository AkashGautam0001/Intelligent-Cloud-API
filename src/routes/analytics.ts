import { Router } from "express";
import { z } from "zod";
import { PageView } from "../models/PageView";
import { requireAuth } from "../middleware/auth";
import { resolveCountry, utcDay } from "../lib/geo";

export const analyticsPublicRouter = Router();
export const analyticsAdminRouter = Router();

const pageviewSchema = z.object({
  visitorId: z.string().trim().min(8).max(80),
  path: z.string().trim().min(1).max(500),
  referrer: z.string().trim().max(1000).optional().default(""),
});

const rangeSchema = z.enum(["today", "7d", "30d", "total"]).default("7d");

/** Soft rate limit: one pageview per visitor+path per 30s */
const recentHits = new Map<string, number>();
const HIT_WINDOW_MS = 30_000;

function normalizePath(path: string): string {
  try {
    const url = new URL(path, "https://intelligent-cloud.local");
    const clean = url.pathname || "/";
    return clean.length > 500 ? clean.slice(0, 500) : clean;
  } catch {
    return path.startsWith("/") ? path.slice(0, 500) : `/${path.slice(0, 499)}`;
  }
}

function rangeStart(range: z.infer<typeof rangeSchema>): Date | null {
  if (range === "total") return null;
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  if (range === "today") return startOfToday;
  if (range === "7d") {
    return new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
  }
  return new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);
}

analyticsPublicRouter.post("/pageview", async (req, res, next) => {
  try {
    const body = pageviewSchema.parse(req.body);
    const path = normalizePath(body.path);
    const visitorId = body.visitorId.slice(0, 80);
    const key = `${visitorId}:${path}`;
    const now = Date.now();
    const last = recentHits.get(key) ?? 0;
    if (now - last < HIT_WINDOW_MS) {
      res.status(202).json({ success: true, deduped: true });
      return;
    }
    recentHits.set(key, now);

    if (recentHits.size > 5000) {
      for (const [k, ts] of recentHits) {
        if (now - ts > HIT_WINDOW_MS * 4) recentHits.delete(k);
      }
    }

    const country = await resolveCountry(req);

    await PageView.create({
      visitorId,
      path,
      referrer: body.referrer || "",
      country,
      day: utcDay(),
    });

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

analyticsAdminRouter.use(requireAuth);

analyticsAdminRouter.get("/summary", async (req, res, next) => {
  try {
    const range = rangeSchema.parse(
      typeof req.query.range === "string" ? req.query.range : "7d",
    );
    const start = rangeStart(range);
    const match =
      start == null ? {} : { createdAt: { $gte: start } };

    const [visits, uniqueIds, countriesTracked, topCountries, topPages] =
      await Promise.all([
        PageView.countDocuments(match),
        PageView.distinct("visitorId", match).then((ids) => ids.length),
        PageView.distinct("country", {
          ...match,
          country: { $ne: "XX" },
        }).then((ids) => ids.length),
        PageView.aggregate<{ _id: string; count: number }>([
          {
            $match: {
              ...match,
              country: { $ne: "XX" },
            },
          },
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
        PageView.aggregate<{ _id: string; count: number }>([
          { $match: match },
          { $group: { _id: "$path", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        range,
        visits,
        uniqueVisitors: uniqueIds,
        countriesTracked,
        topCountries: topCountries.map((row) => ({
          country: row._id,
          count: row.count,
        })),
        topPages: topPages.map((row) => ({
          path: row._id,
          count: row.count,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

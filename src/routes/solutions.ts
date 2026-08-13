import { Router } from "express";
import { z } from "zod";
import { Solution } from "../models/Solution";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { sanitizeRichHtml, slugify } from "../utils/helpers";

export const solutionsRouter = Router();
export const solutionsAdminRouter = Router();

solutionsRouter.get("/", async (req, res, next) => {
  try {
    const audience = req.query.audience as string | undefined;
    const filter: Record<string, unknown> = { published: true };
    if (audience === "startup" || audience === "enterprise") {
      filter.audiences = audience;
    }
    const items = await Solution.find(filter).sort({ order: 1, title: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

solutionsRouter.get("/:slug", async (req, res, next) => {
  try {
    const item = await Solution.findOne({ slug: req.params.slug, published: true });
    if (!item) {
      throw new AppError("Solution not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

const solutionBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  summary: z.string().optional(),
  bodyHtml: z.string().optional(),
  bodyJson: z.any().optional(),
  audiences: z.array(z.enum(["startup", "enterprise"])).optional(),
  pillar: z.enum(["migration", "devops", "security", "general"]).optional(),
  highlights: z.array(z.string()).optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

solutionsAdminRouter.use(requireAuth);

solutionsAdminRouter.get("/", async (_req, res, next) => {
  try {
    const items = await Solution.find().sort({ order: 1, title: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

solutionsAdminRouter.post("/", async (req, res, next) => {
  try {
    const body = solutionBodySchema.parse(req.body);
    const slug = slugify(body.slug || body.title);
    const exists = await Solution.findOne({ slug });
    if (exists) {
      throw new AppError("Slug already exists", 409);
    }
    const item = await Solution.create({
      ...body,
      slug,
      bodyHtml: sanitizeRichHtml(body.bodyHtml || ""),
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

solutionsAdminRouter.put("/:id", async (req, res, next) => {
  try {
    const body = solutionBodySchema.partial().parse(req.body);
    if (body.slug) body.slug = slugify(body.slug);
    if (body.bodyHtml !== undefined) {
      body.bodyHtml = sanitizeRichHtml(body.bodyHtml);
    }
    const item = await Solution.findByIdAndUpdate(req.params.id, { $set: body }, { new: true });
    if (!item) {
      throw new AppError("Solution not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

solutionsAdminRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await Solution.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("Solution not found", 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

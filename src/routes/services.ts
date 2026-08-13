import { Router } from "express";
import { z } from "zod";
import { Service } from "../models/Service";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { sanitizeRichHtml, slugify } from "../utils/helpers";

export const servicesRouter = Router();
export const servicesAdminRouter = Router();

servicesRouter.get("/", async (_req, res, next) => {
  try {
    const items = await Service.find({ published: true }).sort({ order: 1, title: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

servicesRouter.get("/:slug", async (req, res, next) => {
  try {
    const item = await Service.findOne({ slug: req.params.slug, published: true });
    if (!item) {
      throw new AppError("Service not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

const serviceBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  summary: z.string().optional(),
  bodyHtml: z.string().optional(),
  bodyJson: z.any().optional(),
  iconKey: z.string().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

servicesAdminRouter.use(requireAuth);

servicesAdminRouter.get("/", async (_req, res, next) => {
  try {
    const items = await Service.find().sort({ order: 1, title: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

servicesAdminRouter.post("/", async (req, res, next) => {
  try {
    const body = serviceBodySchema.parse(req.body);
    const slug = slugify(body.slug || body.title);
    const exists = await Service.findOne({ slug });
    if (exists) {
      throw new AppError("Slug already exists", 409);
    }
    const item = await Service.create({
      ...body,
      slug,
      bodyHtml: sanitizeRichHtml(body.bodyHtml || ""),
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

servicesAdminRouter.put("/reorder", async (req, res, next) => {
  try {
    const schema = z.object({
      items: z.array(z.object({ id: z.string(), order: z.number() })),
    });
    const { items } = schema.parse(req.body);
    await Promise.all(
      items.map((row) => Service.findByIdAndUpdate(row.id, { $set: { order: row.order } })),
    );
    const data = await Service.find().sort({ order: 1, title: 1 });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

servicesAdminRouter.put("/:id", async (req, res, next) => {
  try {
    const body = serviceBodySchema.partial().parse(req.body);
    if (body.slug) body.slug = slugify(body.slug);
    if (body.bodyHtml !== undefined) {
      body.bodyHtml = sanitizeRichHtml(body.bodyHtml);
    }
    const item = await Service.findByIdAndUpdate(req.params.id, { $set: body }, { new: true });
    if (!item) {
      throw new AppError("Service not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

servicesAdminRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await Service.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("Service not found", 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

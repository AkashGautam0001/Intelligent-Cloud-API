import { Router } from "express";
import { z } from "zod";
import { Partner } from "../models/Partner";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";

export const partnersRouter = Router();
export const partnersAdminRouter = Router();

partnersRouter.get("/", async (_req, res, next) => {
  try {
    const items = await Partner.find({ published: true }).sort({ order: 1, name: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

const partnerBodySchema = z.object({
  name: z.string().min(1),
  logoPath: z.string().optional(),
  url: z.string().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

partnersAdminRouter.use(requireAuth);

partnersAdminRouter.get("/", async (_req, res, next) => {
  try {
    const items = await Partner.find().sort({ order: 1, name: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

partnersAdminRouter.post("/", async (req, res, next) => {
  try {
    const body = partnerBodySchema.parse(req.body);
    const item = await Partner.create(body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

partnersAdminRouter.put("/reorder", async (req, res, next) => {
  try {
    const schema = z.object({
      items: z.array(z.object({ id: z.string(), order: z.number() })),
    });
    const { items } = schema.parse(req.body);
    await Promise.all(
      items.map((row) => Partner.findByIdAndUpdate(row.id, { $set: { order: row.order } })),
    );
    const data = await Partner.find().sort({ order: 1, name: 1 });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

partnersAdminRouter.put("/:id", async (req, res, next) => {
  try {
    const body = partnerBodySchema.partial().parse(req.body);
    const item = await Partner.findByIdAndUpdate(req.params.id, { $set: body }, { new: true });
    if (!item) {
      throw new AppError("Partner not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

partnersAdminRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await Partner.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("Partner not found", 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

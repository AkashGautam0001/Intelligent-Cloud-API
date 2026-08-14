import { Router } from "express";
import { z } from "zod";
import { Faq } from "../models/Faq";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { sanitizeRichHtml } from "../utils/helpers";

export const faqsRouter = Router();
export const faqsAdminRouter = Router();

faqsRouter.get("/", async (req, res, next) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const filter: Record<string, unknown> = { published: true };
    if (category) filter.category = category.toLowerCase();
    const items = await Faq.find(filter).sort({ order: 1, question: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

faqsRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await Faq.findOne({ _id: req.params.id, published: true });
    if (!item) {
      throw new AppError("FAQ not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

const faqBodySchema = z.object({
  question: z.string().min(1),
  questionAr: z.string().optional(),
  answerHtml: z.string().optional(),
  answerHtmlAr: z.string().optional(),
  answerJson: z.any().optional(),
  category: z.string().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

faqsAdminRouter.use(requireAuth);

faqsAdminRouter.get("/", async (_req, res, next) => {
  try {
    const items = await Faq.find().sort({ order: 1, question: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

faqsAdminRouter.post("/", async (req, res, next) => {
  try {
    const body = faqBodySchema.parse(req.body);
    const item = await Faq.create({
      ...body,
      category: (body.category || "general").toLowerCase(),
      answerHtml: sanitizeRichHtml(body.answerHtml || ""),
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

faqsAdminRouter.put("/reorder", async (req, res, next) => {
  try {
    const schema = z.object({
      items: z.array(z.object({ id: z.string(), order: z.number() })),
    });
    const { items } = schema.parse(req.body);
    await Promise.all(
      items.map((row) => Faq.findByIdAndUpdate(row.id, { $set: { order: row.order } })),
    );
    const data = await Faq.find().sort({ order: 1, question: 1 });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

faqsAdminRouter.put("/:id", async (req, res, next) => {
  try {
    const body = faqBodySchema.partial().parse(req.body);
    if (body.category) body.category = body.category.toLowerCase();
    if (body.answerHtml !== undefined) {
      body.answerHtml = sanitizeRichHtml(body.answerHtml);
    }
    const item = await Faq.findByIdAndUpdate(req.params.id, { $set: body }, { new: true });
    if (!item) {
      throw new AppError("FAQ not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

faqsAdminRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await Faq.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("FAQ not found", 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

import { Router } from "express";
import { z } from "zod";
import { DocCategory } from "../models/DocCategory";
import { DocArticle } from "../models/DocArticle";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { sanitizeRichHtml, slugify } from "../utils/helpers";

export const docsRouter = Router();
export const docsAdminRouter = Router();

docsRouter.get("/", async (_req, res, next) => {
  try {
    const categories = await DocCategory.find({ published: true }).sort({ order: 1, title: 1 });
    const articles = await DocArticle.find({ published: true })
      .select("title slug summary order category updatedAt")
      .sort({ order: 1, title: 1 });

    const data = categories.map((category) => ({
      ...category.toObject(),
      articles: articles.filter((article) => String(article.category) === String(category._id)),
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

docsRouter.get("/categories/:slug", async (req, res, next) => {
  try {
    const category = await DocCategory.findOne({
      slug: req.params.slug,
      published: true,
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    const articles = await DocArticle.find({
      category: category._id,
      published: true,
    })
      .select("title slug summary order updatedAt")
      .sort({ order: 1, title: 1 });

    res.json({ success: true, data: { ...category.toObject(), articles } });
  } catch (err) {
    next(err);
  }
});

docsRouter.get("/:categorySlug/:articleSlug", async (req, res, next) => {
  try {
    const category = await DocCategory.findOne({
      slug: req.params.categorySlug,
      published: true,
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    const article = await DocArticle.findOne({
      category: category._id,
      slug: req.params.articleSlug,
      published: true,
    });
    if (!article) {
      throw new AppError("Article not found", 404);
    }
    res.json({
      success: true,
      data: {
        ...article.toObject(),
        category: {
          _id: category._id,
          title: category.title,
          slug: category.slug,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

const categoryBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

const articleBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  category: z.string().min(1),
  summary: z.string().optional(),
  bodyHtml: z.string().optional(),
  bodyJson: z.any().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

docsAdminRouter.use(requireAuth);

docsAdminRouter.get("/categories", async (_req, res, next) => {
  try {
    const items = await DocCategory.find().sort({ order: 1, title: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

docsAdminRouter.post("/categories", async (req, res, next) => {
  try {
    const body = categoryBodySchema.parse(req.body);
    const slug = slugify(body.slug || body.title);
    const exists = await DocCategory.findOne({ slug });
    if (exists) {
      throw new AppError("Category slug already exists", 409);
    }
    const item = await DocCategory.create({ ...body, slug });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

docsAdminRouter.put("/categories/:id", async (req, res, next) => {
  try {
    const body = categoryBodySchema.partial().parse(req.body);
    if (body.slug) body.slug = slugify(body.slug);
    const item = await DocCategory.findByIdAndUpdate(req.params.id, { $set: body }, { new: true });
    if (!item) {
      throw new AppError("Category not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

docsAdminRouter.delete("/categories/:id", async (req, res, next) => {
  try {
    const articleCount = await DocArticle.countDocuments({ category: req.params.id });
    if (articleCount > 0) {
      throw new AppError("Delete or move articles before removing this category", 400);
    }
    const item = await DocCategory.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("Category not found", 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

docsAdminRouter.get("/articles", async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = {};
    if (typeof req.query.category === "string" && req.query.category) {
      filter.category = req.query.category;
    }
    const items = await DocArticle.find(filter)
      .populate("category", "title slug")
      .sort({ order: 1, title: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

docsAdminRouter.get("/articles/:id", async (req, res, next) => {
  try {
    const item = await DocArticle.findById(req.params.id).populate("category", "title slug");
    if (!item) {
      throw new AppError("Article not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

docsAdminRouter.post("/articles", async (req, res, next) => {
  try {
    const body = articleBodySchema.parse(req.body);
    const category = await DocCategory.findById(body.category);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    const slug = slugify(body.slug || body.title);
    const exists = await DocArticle.findOne({ category: category._id, slug });
    if (exists) {
      throw new AppError("Article slug already exists in this category", 409);
    }
    const item = await DocArticle.create({
      ...body,
      category: category._id,
      slug,
      bodyHtml: sanitizeRichHtml(body.bodyHtml || ""),
    });
    const populated = await item.populate("category", "title slug");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
});

docsAdminRouter.put("/articles/:id", async (req, res, next) => {
  try {
    const body = articleBodySchema.partial().parse(req.body);
    if (body.slug) body.slug = slugify(body.slug);
    if (body.bodyHtml !== undefined) {
      body.bodyHtml = sanitizeRichHtml(body.bodyHtml);
    }
    if (body.category) {
      const category = await DocCategory.findById(body.category);
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }
    const item = await DocArticle.findByIdAndUpdate(req.params.id, { $set: body }, { new: true }).populate(
      "category",
      "title slug",
    );
    if (!item) {
      throw new AppError("Article not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

docsAdminRouter.delete("/articles/:id", async (req, res, next) => {
  try {
    const item = await DocArticle.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("Article not found", 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

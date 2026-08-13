import { Router } from "express";
import { z } from "zod";
import { Settings } from "../models/Settings";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";

export const settingsRouter = Router();

function toPublic(settings: InstanceType<typeof Settings>) {
  return {
    email: settings.email,
    supportEmail: settings.supportEmail,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    address: settings.address,
    social: settings.social,
    seo: settings.seo,
  };
}

settingsRouter.get("/", async (_req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { key: "site" },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.json({ success: true, data: toPublic(settings) });
  } catch (err) {
    next(err);
  }
});

settingsRouter.get("/admin", requireAuth, async (_req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { key: "site" },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

const updateSchema = z.object({
  email: z.string().email().optional(),
  supportEmail: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  social: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
  seo: z
    .object({
      defaultTitle: z.string().optional(),
      defaultDescription: z.string().optional(),
      ogImageUrl: z.string().optional(),
    })
    .optional(),
});

settingsRouter.put("/admin", requireAuth, async (req, res, next) => {
  try {
    const body = updateSchema.parse(req.body);
    const settings = await Settings.findOneAndUpdate(
      { key: "site" },
      { $set: body },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (!settings) {
      throw new AppError("Unable to update settings", 500);
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

import { Router } from "express";
import { z } from "zod";
import {
  ContactSubmission,
  CONTACT_NEEDS,
  CONTACT_STATUSES,
} from "../models/ContactSubmission";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { spamGuard, clientIp } from "../middleware/spam";
import { notifyTeam, sendMail, sendMailSafe } from "../services/mail";
import { contactAutoReply, contactNotifyTeam } from "../services/emailTemplates";

export const contactRouter = Router();
export const contactsAdminRouter = Router();

const publicContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  phone: z.string().min(1),
  need: z.enum(CONTACT_NEEDS),
  message: z.string().optional().default(""),
  website: z.string().optional(),
  formStartedAt: z.coerce.number(),
});

contactRouter.post("/", spamGuard, async (req, res, next) => {
  try {
    const body = publicContactSchema.parse(req.body);
    const item = await ContactSubmission.create({
      name: body.name,
      email: body.email,
      company: body.company,
      phone: body.phone,
      need: body.need,
      message: body.message || "",
      meta: {
        ip: clientIp(req),
        userAgent: String(req.headers["user-agent"] || ""),
      },
    });

    const payload = {
      id: String(item._id),
      name: item.name,
      email: item.email,
      company: item.company,
      phone: item.phone,
      need: item.need,
      message: item.message || "",
    };
    const teamMail = contactNotifyTeam(payload);
    const reply = contactAutoReply(payload);

    await Promise.all([
      sendMailSafe("contact-notify", () =>
        notifyTeam(teamMail.subject, teamMail.text, teamMail.html),
      ),
      sendMailSafe("contact-auto-reply", () =>
        sendMail({
          to: item.email,
          subject: reply.subject,
          text: reply.text,
          html: reply.html,
        }),
      ),
    ]);

    res.status(201).json({
      success: true,
      data: { id: item._id },
    });
  } catch (err) {
    next(err);
  }
});

contactsAdminRouter.use(requireAuth);

contactsAdminRouter.get("/", async (req, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const filter: Record<string, unknown> = {};
    if (status && (CONTACT_STATUSES as readonly string[]).includes(status)) {
      filter.status = status;
    }
    const items = await ContactSubmission.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

contactsAdminRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await ContactSubmission.findById(req.params.id);
    if (!item) {
      throw new AppError("Contact submission not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

contactsAdminRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = z
      .object({
        status: z.enum(CONTACT_STATUSES),
      })
      .parse(req.body);
    const item = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { $set: { status: body.status } },
      { new: true },
    );
    if (!item) {
      throw new AppError("Contact submission not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

contactsAdminRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await ContactSubmission.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("Contact submission not found", 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

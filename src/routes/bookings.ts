import { Router } from "express";
import { z } from "zod";
import {
  BookingRequest,
  BOOKING_NEEDS,
  BOOKING_STATUSES,
} from "../models/BookingRequest";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { spamGuard, clientIp } from "../middleware/spam";
import { notifyTeam, sendMail, sendMailSafe } from "../services/mail";
import {
  bookingReceivedConfirm,
  bookingReceivedTeam,
} from "../services/emailTemplates";
import { emailSchema, phoneSchema } from "../lib/validation";

export const bookingsRouter = Router();
export const bookingsAdminRouter = Router();

const publicBookingSchema = z.object({
  need: z.enum(BOOKING_NEEDS),
  name: z.string().trim().min(2),
  email: emailSchema,
  company: z.string().trim().min(2),
  phone: phoneSchema,
  preferredDate: z.string().min(1),
  preferredTime: z.string().min(1),
  notes: z.string().optional().default(""),
  website: z.string().optional(),
  formStartedAt: z.coerce.number(),
});

function reminderDateFromPreferred(preferredDate: string): Date | null {
  const parsed = new Date(`${preferredDate}T09:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const reminder = new Date(parsed.getTime() - 24 * 60 * 60 * 1000);
  return reminder;
}

bookingsRouter.post("/", spamGuard, async (req, res, next) => {
  try {
    const body = publicBookingSchema.parse(req.body);
    const reminderAt = reminderDateFromPreferred(body.preferredDate);

    const item = await BookingRequest.create({
      need: body.need,
      name: body.name,
      email: body.email,
      company: body.company,
      phone: body.phone,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      notes: body.notes || "",
      reminderAt,
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
      preferredDate: item.preferredDate,
      preferredTime: item.preferredTime,
      notes: item.notes || "",
    };
    const teamMail = bookingReceivedTeam(payload);
    const confirm = bookingReceivedConfirm(payload);

    await Promise.all([
      sendMailSafe("booking-notify", () =>
        notifyTeam(teamMail.subject, teamMail.text, teamMail.html),
      ),
      sendMailSafe("booking-confirm", () =>
        sendMail({
          to: item.email,
          subject: confirm.subject,
          text: confirm.text,
          html: confirm.html,
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

bookingsAdminRouter.use(requireAuth);

bookingsAdminRouter.get("/", async (req, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const filter: Record<string, unknown> = {};
    if (status && (BOOKING_STATUSES as readonly string[]).includes(status)) {
      filter.status = status;
    }
    const items = await BookingRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

bookingsAdminRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await BookingRequest.findById(req.params.id);
    if (!item) {
      throw new AppError("Booking not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

bookingsAdminRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = z
      .object({
        status: z.enum(BOOKING_STATUSES).optional(),
        preferredDate: z.string().optional(),
        preferredTime: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(req.body);

    const $set: Record<string, unknown> = { ...body };
    if (body.preferredDate) {
      $set.reminderAt = reminderDateFromPreferred(body.preferredDate);
      $set.reminderSentAt = null;
    }

    const item = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true },
    );
    if (!item) {
      throw new AppError("Booking not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

bookingsAdminRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await BookingRequest.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("Booking not found", 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

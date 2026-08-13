import { Router } from "express";
import { z } from "zod";
import { Ticket, TICKET_STATUSES, TICKET_TIERS } from "../models/Ticket";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { spamGuard, clientIp } from "../middleware/spam";
import { notifyTeam, sendMail, sendMailSafe } from "../services/mail";
import { ticketAck, ticketNotifyTeam } from "../services/emailTemplates";

export const ticketsPublicRouter = Router();
export const ticketsAdminRouter = Router();

const publicTicketSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email("Enter a valid email address"),
  subject: z.string().trim().min(5),
  body: z.string().trim().min(20),
  tier: z.enum(TICKET_TIERS).optional().default("standard"),
  website: z.string().optional(),
  formStartedAt: z.coerce.number(),
});

ticketsPublicRouter.post("/", spamGuard, async (req, res, next) => {
  try {
    const body = publicTicketSchema.parse(req.body);
    const item = await Ticket.create({
      name: body.name,
      email: body.email,
      subject: body.subject,
      body: body.body,
      tier: body.tier,
      meta: {
        ip: clientIp(req),
        userAgent: String(req.headers["user-agent"] || ""),
      },
    });

    const payload = {
      id: String(item._id),
      name: item.name,
      email: item.email,
      subject: item.subject,
      body: item.body,
      tier: item.tier,
    };
    const teamMail = ticketNotifyTeam(payload);
    const ack = ticketAck(payload);

    await Promise.all([
      sendMailSafe("ticket-notify", () =>
        notifyTeam(teamMail.subject, teamMail.text, teamMail.html),
      ),
      sendMailSafe("ticket-ack", () =>
        sendMail({
          to: item.email,
          subject: ack.subject,
          text: ack.text,
          html: ack.html,
        }),
      ),
    ]);

    res.status(201).json({ success: true, data: { id: item._id } });
  } catch (err) {
    next(err);
  }
});

ticketsAdminRouter.use(requireAuth);

ticketsAdminRouter.get("/", async (req, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const filter: Record<string, unknown> = {};
    if (status && (TICKET_STATUSES as readonly string[]).includes(status)) {
      filter.status = status;
    }
    const items = await Ticket.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

ticketsAdminRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await Ticket.findById(req.params.id);
    if (!item) {
      throw new AppError("Ticket not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

ticketsAdminRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = z
      .object({
        status: z.enum(TICKET_STATUSES).optional(),
        tier: z.enum(TICKET_TIERS).optional(),
        adminNotes: z.string().optional(),
      })
      .parse(req.body);

    const item = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true },
    );
    if (!item) {
      throw new AppError("Ticket not found", 404);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

ticketsAdminRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await Ticket.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError("Ticket not found", 404);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

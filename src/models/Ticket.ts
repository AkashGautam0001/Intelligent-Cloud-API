import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const TICKET_TIERS = [
  "standard",
  "managed-operations",
  "priority",
] as const;

export const TICKET_STATUSES = [
  "new",
  "in_progress",
  "resolved",
  "closed",
] as const;

const ticketSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    tier: {
      type: String,
      enum: TICKET_TIERS,
      default: "standard",
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: "new",
    },
    adminNotes: { type: String, default: "" },
    meta: {
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

ticketSchema.index({ status: 1, createdAt: -1 });

export type TicketDocument = InferSchemaType<typeof ticketSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Ticket = mongoose.model("Ticket", ticketSchema);

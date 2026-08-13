import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const BOOKING_NEEDS = [
  "Cloud Migration",
  "Managed Cloud",
  "Kubernetes",
  "DevOps",
  "Security",
  "Other",
] as const;

export const BOOKING_STATUSES = [
  "new",
  "confirmed",
  "completed",
  "cancelled",
] as const;

const bookingRequestSchema = new Schema(
  {
    need: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    preferredDate: { type: String, required: true, trim: true },
    preferredTime: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "new",
    },
    reminderAt: { type: Date, default: null },
    reminderSentAt: { type: Date, default: null },
    meta: {
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

bookingRequestSchema.index({ status: 1, createdAt: -1 });
bookingRequestSchema.index({ reminderAt: 1, reminderSentAt: 1 });

export type BookingRequestDocument = InferSchemaType<typeof bookingRequestSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BookingRequest = mongoose.model("BookingRequest", bookingRequestSchema);

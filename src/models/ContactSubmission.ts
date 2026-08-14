import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const CONTACT_NEEDS = [
  "Cloud Migration",
  "Managed Services",
  "Kubernetes",
  "DevOps Consulting",
  "Partnership",
  "Other",
] as const;

export const CONTACT_STATUSES = ["new", "reviewed", "archived"] as const;

const contactSubmissionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    need: { type: String, required: true, trim: true },
    message: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: CONTACT_STATUSES,
      default: "new",
    },
    meta: {
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

contactSubmissionSchema.index({ status: 1, createdAt: -1 });

export type ContactSubmissionDocument = InferSchemaType<typeof contactSubmissionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ContactSubmission = mongoose.model(
  "ContactSubmission",
  contactSubmissionSchema,
);

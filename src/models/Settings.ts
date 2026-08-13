import mongoose, { Schema, type InferSchemaType } from "mongoose";

const socialSchema = new Schema(
  {
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  { _id: false },
);

const seoSchema = new Schema(
  {
    defaultTitle: { type: String, default: "Cloud Services | Intelligent Cloud" },
    defaultDescription: {
      type: String,
      default:
        "Intelligent Cloud provides Cloud Migration, Managed Cloud, AI Solutions, Cybersecurity, DevOps, and Data Analytics services for startups and enterprises.",
    },
    ogImageUrl: { type: String, default: "" },
  },
  { _id: false },
);

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "site" },
    email: { type: String, default: "sales@intelligent-cloud.com" },
    supportEmail: { type: String, default: "support@intelligent-cloud.com" },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "+966596264058" },
    address: {
      type: String,
      default: "Remote-first, serving clients globally",
    },
    social: { type: socialSchema, default: () => ({}) },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export type SettingsDocument = InferSchemaType<typeof settingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Settings = mongoose.model("Settings", settingsSchema);

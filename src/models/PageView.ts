import mongoose, { Schema, type InferSchemaType } from "mongoose";

const pageViewSchema = new Schema(
  {
    visitorId: { type: String, required: true, trim: true, index: true },
    path: { type: String, required: true, trim: true, maxlength: 500 },
    referrer: { type: String, default: "", trim: true, maxlength: 1000 },
    country: { type: String, default: "XX", trim: true, uppercase: true, maxlength: 2 },
    /** Calendar day UTC YYYY-MM-DD for fast daily aggregates */
    day: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ country: 1, createdAt: -1 });
pageViewSchema.index({ path: 1, createdAt: -1 });
pageViewSchema.index({ visitorId: 1, path: 1, createdAt: -1 });

export type PageViewDocument = InferSchemaType<typeof pageViewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PageView = mongoose.model("PageView", pageViewSchema);

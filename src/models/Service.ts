import mongoose, { Schema, type InferSchemaType } from "mongoose";

const serviceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
    bodyJson: { type: Schema.Types.Mixed, default: null },
    iconKey: { type: String, default: "cloud-computing" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

serviceSchema.index({ order: 1 });

export type ServiceDocument = InferSchemaType<typeof serviceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Service = mongoose.model("Service", serviceSchema);

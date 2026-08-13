import mongoose, { Schema, type InferSchemaType } from "mongoose";

const partnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logoPath: { type: String, default: "" },
    url: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

partnerSchema.index({ order: 1 });

export type PartnerDocument = InferSchemaType<typeof partnerSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Partner = mongoose.model("Partner", partnerSchema);

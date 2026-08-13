import mongoose, { Schema, type InferSchemaType } from "mongoose";

const solutionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
    bodyJson: { type: Schema.Types.Mixed, default: null },
    audiences: {
      type: [String],
      enum: ["startup", "enterprise"],
      default: ["startup", "enterprise"],
    },
    pillar: {
      type: String,
      enum: ["migration", "devops", "security", "general"],
      default: "general",
    },
    highlights: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

solutionSchema.index({ order: 1 });

export type SolutionDocument = InferSchemaType<typeof solutionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Solution = mongoose.model("Solution", solutionSchema);

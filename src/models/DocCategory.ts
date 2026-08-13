import mongoose, { Schema, type InferSchemaType } from "mongoose";

const docCategorySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

docCategorySchema.index({ order: 1 });

export type DocCategoryDocument = InferSchemaType<typeof docCategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DocCategory = mongoose.model("DocCategory", docCategorySchema);

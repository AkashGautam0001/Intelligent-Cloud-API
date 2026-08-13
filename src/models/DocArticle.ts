import mongoose, { Schema, type InferSchemaType } from "mongoose";

const docArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "DocCategory", required: true },
    summary: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
    bodyJson: { type: Schema.Types.Mixed, default: null },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

docArticleSchema.index({ category: 1, order: 1 });
docArticleSchema.index({ category: 1, slug: 1 }, { unique: true });

export type DocArticleDocument = InferSchemaType<typeof docArticleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DocArticle = mongoose.model("DocArticle", docArticleSchema);

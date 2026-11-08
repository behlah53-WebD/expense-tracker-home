import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
// Filtered category lists (by type) + name sort
CategorySchema.index({ userId: 1, type: 1, name: 1 });

// Duplicate-name check in POST /categories (regex findOne)
CategorySchema.index({ userId: 1, name: 1, type: 1 }, { collation: { locale: "en", strength: 2 } });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;

import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBudget extends Document {
  _id: mongoose.Types.ObjectId;
  limit: number;
  month: number;
  year: number;
  categoryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    limit: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, month: 1, year: 1 });
BudgetSchema.index({ userId: 1, categoryId: 1, month: 1, year: 1 }, { unique: true });

const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);

export default Budget;


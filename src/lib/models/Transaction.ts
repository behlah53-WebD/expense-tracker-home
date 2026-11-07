import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note?: string;
  date: Date;
  recurring: boolean;
  categoryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },
    note: { type: String, trim: true },
    date: { type: Date, required: true, default: Date.now },
    recurring: { type: Boolean, default: false },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ userId: 1, categoryId: 1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;


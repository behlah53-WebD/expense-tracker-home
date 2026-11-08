import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Category from "@/lib/models/Category";
import mongoose from "mongoose";
import { transactionSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

function normalise(t: any) {
  return {
    id: t._id.toString(),
    amount: t.amount,
    type: t.type,
    note: t.note || null,
    date: t.date,
    recurring: t.recurring,
    userId: t.userId.toString(),
    categoryId: t.categoryId?._id?.toString() ?? t.categoryId?.toString(),
    category: t.categoryId
      ? {
          id: t.categoryId._id?.toString() ?? t.categoryId.toString(),
          name: t.categoryId.name,
          color: t.categoryId.color,
          icon: t.categoryId.icon,
          type: t.categoryId.type,
        }
      : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const t0 = Date.now();
    const session = await auth();
    const authMs = Date.now() - t0;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const t1 = Date.now();
    await connectDB();
    const dbConnectMs = Date.now() - t1;

    const transaction = await Transaction.findOne({ _id: id, userId: session.user.id })
      .select("amount type note date recurring categoryId userId createdAt updatedAt")
      .populate("categoryId", "name color icon type")
      .lean();

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const totalMs = Date.now() - t0;

    return NextResponse.json({
      ...normalise(transaction as any),
      timing: { authMs, dbConnectMs, totalMs },
    });
  } catch (error) {
    console.error("Transaction GET error:", error);
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const result = transactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, type, categoryId, date, note, recurring } = result.data;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Invalid category selected" }, { status: 400 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const catObjId = new mongoose.Types.ObjectId(categoryId);

    // Verify category ownership (lean, select _id only → index-covered)
    const category = await Category.findOne({ _id: catObjId, userId }, { _id: 1 }).lean();
    if (!category) {
      return NextResponse.json({ error: "Invalid category selected" }, { status: 400 });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      {
        amount,
        type,
        categoryId: catObjId,
        date: new Date(date),
        note: note ? note.trim() : undefined,
        recurring: !!recurring,
      },
      { new: true }
    )
      .select("amount type note date recurring categoryId userId createdAt updatedAt")
      .populate("categoryId", "name color icon type")
      .lean();

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(normalise(transaction as any));
  } catch (error) {
    console.error("Transaction PUT error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await connectDB();

    const deleted = await Transaction.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Transaction DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}

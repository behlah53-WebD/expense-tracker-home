import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Category from "@/lib/models/Category";
import mongoose from "mongoose";
import { transactionSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(
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

    await connectDB();

    const transaction = await Transaction.findOne({
      _id: id,
      userId: session.user.id,
    })
      .populate("categoryId", "name color icon type")
      .lean();

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const t = transaction as any;
    return NextResponse.json({
      id: t._id.toString(),
      amount: t.amount,
      type: t.type,
      note: t.note || null,
      date: t.date,
      recurring: t.recurring,
      userId: t.userId.toString(),
      categoryId: t.categoryId?._id?.toString(),
      category: t.categoryId
        ? {
            id: t.categoryId._id.toString(),
            name: t.categoryId.name,
            color: t.categoryId.color,
            icon: t.categoryId.icon,
            type: t.categoryId.type,
          }
        : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
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

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Invalid category selected" }, { status: 400 });
    }

    const category = await Category.findOne({
      _id: new mongoose.Types.ObjectId(categoryId),
      userId,
    }).lean();

    if (!category) {
      return NextResponse.json({ error: "Invalid category selected" }, { status: 400 });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      {
        amount,
        type,
        categoryId: new mongoose.Types.ObjectId(categoryId),
        date: new Date(date),
        note: note ? note.trim() : undefined,
        recurring: !!recurring,
      },
      { new: true }
    )
      .populate("categoryId", "name color icon type")
      .lean();

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const t = transaction as any;
    return NextResponse.json({
      id: t._id.toString(),
      amount: t.amount,
      type: t.type,
      note: t.note || null,
      date: t.date,
      recurring: t.recurring,
      userId: t.userId.toString(),
      categoryId: t.categoryId?._id?.toString(),
      category: t.categoryId
        ? {
            id: t.categoryId._id.toString(),
            name: t.categoryId.name,
            color: t.categoryId.color,
            icon: t.categoryId.icon,
            type: t.categoryId.type,
          }
        : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    });
  } catch (error) {
    console.error("Transaction PUT error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(
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

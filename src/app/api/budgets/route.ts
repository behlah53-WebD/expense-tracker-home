import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Budget from "@/lib/models/Budget";
import Category from "@/lib/models/Category";
import Transaction from "@/lib/models/Transaction";
import mongoose from "mongoose";
import { budgetSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get("month") || (now.getMonth() + 1).toString());
    const year = parseInt(searchParams.get("year") || now.getFullYear().toString());

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Date range for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch budgets and compute actual spending concurrently via Promise.all
    const [budgets, expenses] = await Promise.all([
      Budget.find({ userId, month, year })
        .populate("categoryId", "name color icon type")
        .lean(),
      Transaction.aggregate([
        {
          $match: {
            userId,
            type: "EXPENSE",
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: "$categoryId",
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const spendMap = new Map<string, number>(
      expenses.map((e) => [e._id.toString(), e.total])
    );

    const budgetsWithSpend = (budgets as any[]).map((b) => {
      const categoryId = b.categoryId?._id?.toString() || b.categoryId?.toString();
      const spent = spendMap.get(categoryId) || 0;
      const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return {
        id: b._id.toString(),
        limit: b.limit,
        month: b.month,
        year: b.year,
        userId: b.userId.toString(),
        categoryId,
        category: b.categoryId
          ? {
              id: b.categoryId._id.toString(),
              name: b.categoryId.name,
              color: b.categoryId.color,
              icon: b.categoryId.icon,
              type: b.categoryId.type,
            }
          : null,
        spent,
        remaining: Math.max(0, b.limit - spent),
        percentage: Math.min(100, Math.round(percentage * 10) / 10),
        rawPercentage: Math.round(percentage * 10) / 10,
        isWarning: percentage >= 80 && percentage < 100,
        isExceeded: percentage >= 100,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    return NextResponse.json({ month, year, budgets: budgetsWithSpend });
  } catch (error) {
    console.error("Budgets GET error:", error);
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = budgetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { categoryId, limit, month, year } = result.data;

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const category = await Category.findOne({
      _id: new mongoose.Types.ObjectId(categoryId),
      userId,
    }).lean();

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      { userId, categoryId: new mongoose.Types.ObjectId(categoryId), month, year },
      { limit },
      { upsert: true, new: true }
    )
      .populate("categoryId", "name color icon type")
      .lean();

    const b = budget as any;
    return NextResponse.json({
      id: b._id.toString(),
      limit: b.limit,
      month: b.month,
      year: b.year,
      userId: b.userId.toString(),
      categoryId: b.categoryId?._id?.toString() || b.categoryId?.toString(),
      category: b.categoryId
        ? {
            id: b.categoryId._id.toString(),
            name: b.categoryId.name,
            color: b.categoryId.color,
            icon: b.categoryId.icon,
            type: b.categoryId.type,
          }
        : null,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    });
  } catch (error) {
    console.error("Budget POST error:", error);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid Budget ID is required" }, { status: 400 });
    }

    await connectDB();

    const deleted = await Budget.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Budget DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}

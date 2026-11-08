import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Category from "@/lib/models/Category";
import mongoose from "mongoose";
import { transactionSchema, transactionFilterSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** Normalise a lean transaction document to the API shape */
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

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawParams = {
      type: searchParams.get("type") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      q: searchParams.get("q") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      sort: searchParams.get("sort") || "date-desc",
    };

    const filterResult = transactionFilterSchema.safeParse(rawParams);
    if (!filterResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: filterResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, categoryId, from, to, q, page, limit, sort } = filterResult.data;

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const query: Record<string, unknown> = { userId };

    if (type) query.type = type;
    if (categoryId && categoryId !== "ALL" && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (from || to) {
      const dateRange: Record<string, Date> = {};
      if (from) dateRange.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateRange.$lte = toDate;
      }
      query.date = dateRange;
    }

    // ── Search: single category query (all matching IDs) then $or ──────────
    // Before: separate Category.find() + reassemble — still one extra round-trip
    // This is unavoidable unless we store denormalised category name on Transaction.
    // We minimise cost by selecting only _id and using an index-covered query.
    if (q) {
      const matchingCats = await Category.find(
        { userId, name: { $regex: q, $options: "i" } },
        { _id: 1 }   // projection: only _id (index-covered)
      ).lean();
      const matchingCategoryIds = matchingCats.map((c) => c._id as mongoose.Types.ObjectId);
      query.$or = [
        { note: { $regex: q, $options: "i" } },
        { categoryId: { $in: matchingCategoryIds } },
      ];
    }

    // Sort order
    let sortQuery: Record<string, 1 | -1> = { date: -1 };
    if (sort === "date-asc") sortQuery = { date: 1 };
    if (sort === "amount-desc") sortQuery = { amount: -1 };
    if (sort === "amount-asc") sortQuery = { amount: 1 };

    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query)
        .select("amount type note date recurring categoryId userId createdAt updatedAt")
        .populate("categoryId", "name color icon type")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      transactions: (transactions as any[]).map(normalise),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Transactions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Verify category ownership (lean + select _id only → index-covered)
    const category = await Category.findOne({ _id: catObjId, userId }, { _id: 1 }).lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      categoryId: catObjId,
      date: new Date(date),
      note: note ? note.trim() : undefined,
      recurring: !!recurring,
      userId,
    });

    // Single query to get the populated response (avoid a second findById)
    const populated = await Transaction.findById(transaction._id)
      .select("amount type note date recurring categoryId userId createdAt updatedAt")
      .populate("categoryId", "name color icon type")
      .lean();

    return NextResponse.json(normalise(populated as any), { status: 201 });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

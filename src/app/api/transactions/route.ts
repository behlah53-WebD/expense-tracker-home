import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Category from "@/lib/models/Category";
import mongoose from "mongoose";
import { transactionSchema, transactionFilterSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

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
    const query: any = { userId };

    if (type) query.type = type;
    if (categoryId && categoryId !== "ALL" && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    // Search query - search in note or category name
    if (q) {
      const matchingCats = await Category.find({
        userId,
        name: { $regex: q, $options: "i" },
      }).select("_id");
      const matchingCategoryIds = matchingCats.map((c) => c._id as mongoose.Types.ObjectId);
      query.$or = [
        { note: { $regex: q, $options: "i" } },
        { categoryId: { $in: matchingCategoryIds } },
      ];
    }

    // Sort order
    let sortQuery: any = { date: -1 };
    if (sort === "date-asc") sortQuery = { date: 1 };
    if (sort === "amount-desc") sortQuery = { amount: -1 };
    if (sort === "amount-asc") sortQuery = { amount: 1 };

    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query)
        .populate("categoryId", "name color icon type")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    const normalized = (transactions as any[]).map((t) => ({
      id: t._id.toString(),
      amount: t.amount,
      type: t.type,
      note: t.note || null,
      date: t.date,
      recurring: t.recurring,
      userId: t.userId.toString(),
      categoryId: t.categoryId?._id?.toString() || t.categoryId?.toString(),
      category: t.categoryId
        ? {
            id: t.categoryId._id?.toString() || t.categoryId.toString(),
            name: t.categoryId.name,
            color: t.categoryId.color,
            icon: t.categoryId.icon,
            type: t.categoryId.type,
          }
        : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      transactions: normalized,
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
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      categoryId: new mongoose.Types.ObjectId(categoryId),
      date: new Date(date),
      note: note ? note.trim() : undefined,
      recurring: !!recurring,
      userId,
    });

    const populated = await Transaction.findById(transaction._id)
      .populate("categoryId", "name color icon type")
      .lean();

    const t = populated as any;
    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

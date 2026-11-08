import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Transaction from "@/lib/models/Transaction";
import mongoose from "mongoose";
import { categorySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const t0 = Date.now();
    const session = await auth();
    const authMs = Date.now() - t0;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const t1 = Date.now();
    await connectDB();
    const dbConnectMs = Date.now() - t1;

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const query: Record<string, unknown> = { userId };
    if (type) query.type = type;

    // ── Run both queries in parallel ─────────────────────────────────────
    const [categories, counts] = await Promise.all([
      Category.find(query)
        .select("name color icon type userId createdAt updatedAt")
        .sort({ name: 1 })
        .lean(),

      Transaction.aggregate([
        { $match: { userId, ...(type ? { type } : {}) } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const result = categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      color: c.color,
      icon: c.icon,
      type: c.type,
      userId: c.userId.toString(),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      _count: { transactions: countMap.get(c._id.toString()) || 0 },
    }));

    const totalMs = Date.now() - t0;

    return NextResponse.json(result, {
      headers: {
        // Client may cache for 60 s; CDN/proxy may cache for 30 s
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
      timing: { authMs, dbConnectMs, totalMs },
    });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, color, icon, type } = result.data;

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const trimmedName = name.trim();

    // Use collation for case-insensitive duplicate check (hits the compound index)
    const existing = await Category.findOne(
      { userId, name: trimmedName, type },
      { _id: 1 }
    )
      .collation({ locale: "en", strength: 2 })
      .lean();

    if (existing) {
      return NextResponse.json(
        { error: `Category "${trimmedName}" already exists for ${type.toLowerCase()}` },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name: trimmedName,
      color,
      icon,
      type,
      userId,
    });

    return NextResponse.json(
      {
        id: category._id.toString(),
        name: category.name,
        color: category.color,
        icon: category.icon,
        type: category.type,
        userId: category.userId.toString(),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Category POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

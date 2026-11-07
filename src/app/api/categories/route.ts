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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const query: any = { userId };
    if (type) query.type = type;

    const categories = await Category.find(query).sort({ name: 1 }).lean();

    // Count transactions per category
    const categoryIds = categories.map((c) => c._id);
    const counts = await Transaction.aggregate([
      { $match: { userId, categoryId: { $in: categoryIds } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
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

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
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

    const existing = await Category.findOne({
      userId,
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      type,
    }).lean();

    if (existing) {
      return NextResponse.json(
        { error: `Category "${name}" already exists for ${type.toLowerCase()}` },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name: name.trim(),
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

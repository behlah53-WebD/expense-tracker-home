import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import mongoose from "mongoose";
import { categorySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

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

    const category = await Category.findOneAndUpdate(
      { _id: id, userId },
      { name: name.trim(), color, icon, type },
      { new: true }
    ).lean();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: category._id.toString(),
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
      userId: category.userId.toString(),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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

    const deleted = await Category.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

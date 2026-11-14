import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Budget from "@/lib/models/Budget";
import Transaction from "@/lib/models/Transaction";
import mongoose from "mongoose";
import { revalidateTag, revalidatePath } from "next/cache";
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
    const categoryObjectId = new mongoose.Types.ObjectId(id);

    const category = await Category.findOneAndUpdate(
      { _id: categoryObjectId, userId },
      { name: name.trim(), color, icon, type },
      { new: true }
    ).lean();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    try {
      revalidateTag(`dashboard-${session.user.id}`, { expire: 0 });
      revalidatePath("/dashboard");
      revalidatePath("/transactions");
      revalidatePath("/settings");
    } catch {
      // Ignore in non-Next request context
    }

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
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
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

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const categoryObjectId = new mongoose.Types.ObjectId(id);

    const deleted = await Category.findOneAndDelete({
      _id: categoryObjectId,
      userId,
    }).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Cascade delete any budgets set for this category
    await Budget.deleteMany({ categoryId: categoryObjectId, userId });

    // Unset categoryId on any transactions associated with this category
    await Transaction.updateMany(
      { categoryId: categoryObjectId, userId },
      { $unset: { categoryId: 1 } }
    );

    try {
      revalidateTag(`dashboard-${session.user.id}`, { expire: 0 });
      revalidatePath("/dashboard");
      revalidatePath("/transactions");
      revalidatePath("/settings");
    } catch {
      // Ignore in non-Next request context
    }

    return NextResponse.json(
      { message: "Category deleted successfully" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Category from "@/lib/models/Category";
import Transaction from "@/lib/models/Transaction";
import Budget from "@/lib/models/Budget";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    await connectDB();

    // Cascade delete all user data
    await Promise.all([
      Transaction.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
      Category.deleteMany({ userId }),
    ]);
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: "Account and all data deleted successfully" });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

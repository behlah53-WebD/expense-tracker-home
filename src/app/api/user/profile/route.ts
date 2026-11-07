import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import mongoose from "mongoose";
import { profileUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, currency } = result.data;

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { name: name.trim(), currency },
      { new: true }
    )
      .select("_id name email currency")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

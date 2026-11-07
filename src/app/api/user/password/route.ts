import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { changePasswordSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    await connectDB();

    const user = await User.findById(session.user.id).lean();

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Password change not available for social login accounts" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(session.user.id, { passwordHash: newHash });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}

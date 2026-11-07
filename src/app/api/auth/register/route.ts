import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Category from "@/lib/models/Category";
import { registerSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#FF8A5C", icon: "Utensils", type: "EXPENSE" as const },
  { name: "Rent", color: "#7C5CFF", icon: "Home", type: "EXPENSE" as const },
  { name: "Travel", color: "#38D5FF", icon: "Plane", type: "EXPENSE" as const },
  { name: "Shopping", color: "#FF5C8A", icon: "ShoppingBag", type: "EXPENSE" as const },
  { name: "Bills", color: "#FFC857", icon: "Receipt", type: "EXPENSE" as const },
  { name: "Health", color: "#2EF2B0", icon: "HeartPulse", type: "EXPENSE" as const },
  { name: "Fun", color: "#C77DFF", icon: "Gamepad2", type: "EXPENSE" as const },
  { name: "Education", color: "#5C8AFF", icon: "GraduationCap", type: "EXPENSE" as const },
  { name: "Other", color: "#8B93B8", icon: "MoreHorizontal", type: "EXPENSE" as const },
  { name: "Salary", color: "#2EF2B0", icon: "Briefcase", type: "INCOME" as const },
  { name: "Freelance", color: "#38D5FF", icon: "Laptop", type: "INCOME" as const },
  { name: "Investments", color: "#FFC857", icon: "TrendingUp", type: "INCOME" as const },
  { name: "Gifts", color: "#C77DFF", icon: "Gift", type: "INCOME" as const },
  { name: "Other Income", color: "#8B93B8", icon: "Coins", type: "INCOME" as const },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    await connectDB();

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      currency: "INR",
    });

    // Create default categories for this user
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId: user._id }))
    );

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          currency: user.currency,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}

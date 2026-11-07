import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "EXPENSE";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    await connectDB();

    const matchQuery: any = { userId, type };

    if (from || to) {
      matchQuery.date = {};
      if (from) matchQuery.date.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        matchQuery.date.$lte = toDate;
      }
    } else {
      const now = new Date();
      matchQuery.date = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    }

    const transactions = await Transaction.find(matchQuery)
      .populate("categoryId", "name color icon type")
      .sort({ amount: -1 })
      .lean();

    const totalAmount = (transactions as any[]).reduce((acc: number, t: any) => acc + t.amount, 0);

    const categoryMap = new Map<string, {
      categoryId: string;
      name: string;
      color: string;
      icon: string;
      amount: number;
      count: number;
      percentage: number;
    }>();

    for (const t of transactions as any[]) {
      const cat = t.categoryId;
      if (!cat) continue;
      const catId = cat._id?.toString() || cat.toString();
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          categoryId: catId,
          name: cat.name || "Unknown",
          color: cat.color || "#8B93B8",
          icon: cat.icon || "MoreHorizontal",
          amount: 0,
          count: 0,
          percentage: 0,
        });
      }
      const item = categoryMap.get(catId)!;
      item.amount += t.amount;
      item.count += 1;
    }

    const categories = Array.from(categoryMap.values()).map((c) => ({
      ...c,
      percentage: totalAmount > 0 ? Math.round((c.amount / totalAmount) * 1000) / 10 : 0,
    }));
    categories.sort((a, b) => b.amount - a.amount);

    const top5Transactions = (transactions as any[]).slice(0, 5).map((t) => ({
      id: t._id.toString(),
      amount: t.amount,
      type: t.type,
      note: t.note || null,
      date: t.date,
      category: t.categoryId
        ? {
            id: t.categoryId._id?.toString(),
            name: t.categoryId.name,
            color: t.categoryId.color,
            icon: t.categoryId.icon,
          }
        : null,
    }));

    const biggestCategory = categories[0]?.name || "None";
    const insights: string[] = [];

    if (categories.length > 0) {
      const topCat = categories[0];
      insights.push(`Your largest ${type === "EXPENSE" ? "expense" : "income source"} is ${topCat.name}, representing ${topCat.percentage}% of your total.`);
      const foodCat = categories.find((c) => c.name.toLowerCase() === "food");
      if (foodCat && foodCat.percentage > 25) {
        insights.push("Food and dining accounts for over a quarter of your spending this period.");
      } else if (foodCat) {
        insights.push("Great job managing food expenses! You kept dining well within normal parameters.");
      }
      const shoppingCat = categories.find((c) => c.name.toLowerCase() === "shopping");
      if (shoppingCat && shoppingCat.percentage > 20) {
        insights.push("Shopping spending is elevated this cycle. Consider setting a dedicated category cap.");
      }
    } else {
      insights.push("Start tracking transactions to reveal AI-powered financial patterns and smart recommendations.");
    }

    return NextResponse.json({ type, totalAmount, categories, top5Transactions, biggestCategory, insights });
  } catch (error) {
    console.error("Reports categories error:", error);
    return NextResponse.json({ error: "Failed to fetch category report" }, { status: 500 });
  }
}

/**
 * GET /api/reports/categories
 *
 * Before: Transaction.find(...).populate(categoryId).sort({amount:-1}).lean()
 *   – loads every individual transaction into memory, then groups in JS
 *
 * After: single $group aggregation with $lookup (no populate N+1)
 *   – hits index { userId:1, type:1, categoryId:1 }
 *   – returns only the grouped summary + top-5 raw docs
 */

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

    // Build date range
    let dateRange: Record<string, Date> | undefined;
    if (from || to) {
      dateRange = {};
      if (from) dateRange.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateRange.$lte = toDate;
      }
    } else {
      const now = new Date();
      dateRange = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    }

    const matchStage: Record<string, unknown> = { userId, type, date: dateRange };

    await connectDB();

    // ── Run group aggregation + top-5 fetch in parallel ───────────────────
    const [grouped, top5Raw] = await Promise.all([
      Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$categoryId",
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "cat",
            pipeline: [{ $project: { name: 1, color: 1, icon: 1 } }],
          },
        },
        { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
        { $sort: { amount: -1 } },
      ]),

      Transaction.find(matchStage)
        .select("amount type note date categoryId")
        .populate("categoryId", "name color icon")
        .sort({ amount: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalAmount = grouped.reduce((s: number, g: any) => s + g.amount, 0);

    const categories = grouped.map((g: any) => ({
      categoryId: g._id?.toString(),
      name: g.cat?.name || "Unknown",
      color: g.cat?.color || "#8B93B8",
      icon: g.cat?.icon || "MoreHorizontal",
      amount: g.amount,
      count: g.count,
      percentage: totalAmount > 0 ? Math.round((g.amount / totalAmount) * 1000) / 10 : 0,
    }));

    const top5Transactions = (top5Raw as any[]).map((t) => ({
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
      insights.push(
        `Your largest ${type === "EXPENSE" ? "expense" : "income source"} is ${topCat.name}, representing ${topCat.percentage}% of your total.`
      );
      const foodCat = categories.find((c: any) => c.name.toLowerCase() === "food");
      if (foodCat && foodCat.percentage > 25) {
        insights.push("Food and dining accounts for over a quarter of your spending this period.");
      } else if (foodCat) {
        insights.push("Great job managing food expenses! You kept dining well within normal parameters.");
      }
      const shoppingCat = categories.find((c: any) => c.name.toLowerCase() === "shopping");
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

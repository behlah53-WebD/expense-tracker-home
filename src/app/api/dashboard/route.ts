import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Category from "@/lib/models/Category";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const t0 = Date.now();
    const session = await auth();
    const authMs = Date.now() - t0;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const t1 = Date.now();
    await connectDB();
    const dbConnectMs = Date.now() - t1;

    // ── Run ALL dashboard queries in parallel ───────────────────────────────
    const [
      buckets,
      recentTransactions,
      categoryAggregation,
      categoryCounts,
    ] = await Promise.all([
      // 1️⃣ Single aggregation for all-time + current + last-month balances
      Transaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: {
                $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
              },
            },
            totalExpense: {
              $sum: {
                $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
              },
            },
            currentIncome: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "INCOME"] },
                      { $gte: ["$date", startOfCurrentMonth] },
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },
            currentExpense: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "EXPENSE"] },
                      { $gte: ["$date", startOfCurrentMonth] },
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },
            lastIncome: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "INCOME"] },
                      { $gte: ["$date", startOfLastMonth] },
                      { $lte: ["$date", endOfLastMonth] },
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },
            lastExpense: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$type", "EXPENSE"] },
                      { $gte: ["$date", startOfLastMonth] },
                      { $lte: ["$date", endOfLastMonth] },
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]),

      // 2️⃣ Recent transactions (limit 6, populated, lean)
      Transaction.find({ userId })
        .select("amount type note date recurring categoryId userId createdAt updatedAt")
        .populate("categoryId", "name color icon type")
        .sort({ date: -1 })
        .limit(6)
        .lean(),

      // 3️⃣ Category aggregation (spending by category)
      Transaction.aggregate([
        { $match: { userId, type: "EXPENSE" } },
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

      // 4️⃣ Category counts for the GET /categories endpoint
      Transaction.aggregate([
        { $match: { userId } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      ]),
    ]);

    const totalMs = Date.now() - t0;

    const b = buckets[0] ?? {
      totalIncome: 0,
      totalExpense: 0,
      currentIncome: 0,
      currentExpense: 0,
      lastIncome: 0,
      lastExpense: 0,
    };

    const totalBalance = b.totalIncome - b.totalExpense;
    const currentNetSavings = b.currentIncome - b.currentExpense;
    const lastNetSavings = b.lastIncome - b.lastExpense;

    const savingsRate =
      b.currentIncome > 0
        ? Math.max(0, Math.min(100, (currentNetSavings / b.currentIncome) * 100))
        : 0;

    const incomeDelta =
      b.lastIncome > 0 ? ((b.currentIncome - b.lastIncome) / b.lastIncome) * 100 : 0;
    const expenseDelta =
      b.lastExpense > 0 ? ((b.currentExpense - b.lastExpense) / b.lastExpense) * 100 : 0;
    const savingsDelta =
      lastNetSavings !== 0
        ? ((currentNetSavings - lastNetSavings) / Math.abs(lastNetSavings)) * 100
        : 0;

    // Normalize recent transactions
    const normalizedRecent = (recentTransactions as any[]).map((t) => ({
      id: t._id.toString(),
      amount: t.amount,
      type: t.type,
      note: t.note || null,
      date: t.date,
      recurring: t.recurring,
      userId: t.userId.toString(),
      categoryId: t.categoryId?._id?.toString() ?? t.categoryId?.toString(),
      category: t.categoryId
        ? {
            id: t.categoryId._id?.toString() ?? t.categoryId.toString(),
            name: t.categoryId.name,
            color: t.categoryId.color,
            icon: t.categoryId.icon,
            type: t.categoryId.type,
          }
        : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    // Process category aggregation
    const categoryData = (categoryAggregation as any[]).map((g: any) => ({
      categoryId: g._id?.toString(),
      name: g.cat?.name || "Unknown",
      color: g.cat?.color || "#8B93B8",
      icon: g.cat?.icon || "MoreHorizontal",
      amount: g.amount,
      count: g.count,
    }));

    // Build category counts map
    const countMap = new Map(
      (categoryCounts as any[]).map((c: any) => [c._id.toString(), c.count])
    );

    // Attach transaction counts to categories
    const categoriesWithCounts = categoryData.map((c: any) => ({
      ...c,
      _count: { transactions: countMap.get(c.categoryId) || 0 },
    }));

    return NextResponse.json({
      totalBalance,
      currentMonth: {
        income: b.currentIncome,
        expense: b.currentExpense,
        netSavings: currentNetSavings,
        savingsRate: Math.round(savingsRate * 10) / 10,
      },
      lastMonth: {
        income: b.lastIncome,
        expense: b.lastExpense,
        netSavings: lastNetSavings,
      },
      deltas: {
        income: Math.round(incomeDelta * 10) / 10,
        expense: Math.round(expenseDelta * 10) / 10,
        savings: Math.round(savingsDelta * 10) / 10,
      },
      recentTransactions: normalizedRecent,
      categories: categoriesWithCounts,
      timing: {
        authMs,
        dbConnectMs,
        totalMs,
      },
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
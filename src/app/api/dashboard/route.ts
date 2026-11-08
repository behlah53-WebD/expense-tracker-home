import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Category from "@/lib/models/Category";
import Budget from "@/lib/models/Budget";
import User from "@/lib/models/User";
import mongoose from "mongoose";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 10;

// Ensure all schemas are registered in mongoose before any populate/lookup
void User;
void Category;
void Budget;
void Transaction;

interface DashboardDataPayload {
  summary: {
    totalBalance: number;
    currentMonth: {
      income: number;
      expense: number;
      netSavings: number;
      savingsRate: number;
    };
    lastMonth: {
      income: number;
      expense: number;
      netSavings: number;
    };
    deltas: {
      income: number;
      expense: number;
      savings: number;
    };
    recentTransactions: any[];
  };
  monthlyTrend: {
    "12M": Array<{ label: string; monthKey: string; income: number; expense: number; net: number }>;
    "30D": Array<{ label: string; income: number; expense: number; net: number }>;
    "7D": Array<{ label: string; income: number; expense: number; net: number }>;
  };
  categoryBreakdown: {
    type: string;
    totalAmount: number;
    categories: Array<{
      categoryId: string;
      name: string;
      color: string;
      icon: string;
      amount: number;
      count: number;
      percentage: number;
    }>;
    insights: string[];
  };
  budgets: Array<{
    id: string;
    limit: number;
    month: number;
    year: number;
    userId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      color: string;
      icon: string;
      type?: string;
    } | null;
    spent: number;
    remaining: number;
    percentage: number;
    rawPercentage: number;
    isWarning: boolean;
    isExceeded: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  dbConnectMs: number;
  queryMs: number;
}

/**
 * Raw data fetcher executing all dashboard queries concurrently via Promise.all.
 */
async function fetchDashboardData(userIdStr: string): Promise<DashboardDataPayload> {
  const tDb0 = Date.now();
  await connectDB();
  const dbConnectMs = Date.now() - tDb0;

  const tQuery0 = Date.now();
  const userId = new mongoose.Types.ObjectId(userIdStr);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
  const twelveMonthsAgo = new Date(currentYear, currentMonth - 11, 1);

  // Run all 5 independent dashboard data operations concurrently
  const [
    buckets,
    recentTransactionsRaw,
    twelveMonthsTxs,
    categoryAggregation,
    userBudgetsRaw,
    budgetExpensesRaw,
  ] = await Promise.all([
    // 1. Single aggregation for all-time balance + current & last-month buckets
    Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0] },
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

    // 2. Recent transactions (lean, limit 6)
    Transaction.find({ userId })
      .select("amount type note date recurring categoryId userId createdAt updatedAt")
      .populate("categoryId", "name color icon type")
      .sort({ date: -1 })
      .limit(6)
      .lean(),

    // 3. 12-month transactions for trend line & area charts
    Transaction.find({
      userId,
      date: { $gte: twelveMonthsAgo },
    })
      .select("amount type date")
      .sort({ date: 1 })
      .lean(),

    // 4. Current month expense category breakdown
    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "EXPENSE",
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
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

    // 5. Budgets for current month & year
    Budget.find({ userId, month: currentMonth + 1, year: currentYear })
      .populate("categoryId", "name color icon type")
      .lean(),

    // 6. Current month category spend for budget progress calculation
    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "EXPENSE",
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const queryMs = Date.now() - tQuery0;

  // Process buckets & deltas
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
  const normalizedRecent = (recentTransactionsRaw as any[]).map((t) => ({
    id: t._id.toString(),
    amount: t.amount,
    type: t.type,
    note: t.note || null,
    date: typeof t.date === "string" ? t.date : t.date.toISOString(),
    recurring: !!t.recurring,
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
    createdAt: t.createdAt ? (typeof t.createdAt === "string" ? t.createdAt : t.createdAt.toISOString()) : undefined,
    updatedAt: t.updatedAt ? (typeof t.updatedAt === "string" ? t.updatedAt : t.updatedAt.toISOString()) : undefined,
  }));

  // Process 12-Month, 30-Day, and 7-Day monthly trend data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap = new Map<string, { label: string; monthKey: string; income: number; expense: number; net: number }>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
    monthlyMap.set(key, { label, monthKey: key, income: 0, expense: 0, net: 0 });
  }

  const daily30Map = new Map<string, { label: string; income: number; expense: number; net: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dayKey = d.toISOString().split("T")[0];
    const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
    daily30Map.set(dayKey, { label, income: 0, expense: 0, net: 0 });
  }

  for (const tx of twelveMonthsTxs as any[]) {
    const txDate = new Date(tx.date);
    const mKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(mKey)) {
      const item = monthlyMap.get(mKey)!;
      if (tx.type === "INCOME") item.income += tx.amount;
      else item.expense += tx.amount;
      item.net = item.income - item.expense;
    }
    const dayKey = txDate.toISOString().split("T")[0];
    if (daily30Map.has(dayKey)) {
      const item = daily30Map.get(dayKey)!;
      if (tx.type === "INCOME") item.income += tx.amount;
      else item.expense += tx.amount;
      item.net = item.income - item.expense;
    }
  }

  const monthlyTrend12M = Array.from(monthlyMap.values());
  const dailyTrend30D = Array.from(daily30Map.values());
  const dailyTrend7D = dailyTrend30D.slice(-7);

  // Process category breakdown
  const catTotalAmount = (categoryAggregation as any[]).reduce((s: number, g: any) => s + g.amount, 0);
  const categoriesBreakdown = (categoryAggregation as any[]).map((g: any) => ({
    categoryId: g._id?.toString(),
    name: g.cat?.name || "Unknown",
    color: g.cat?.color || "#8B93B8",
    icon: g.cat?.icon || "MoreHorizontal",
    amount: g.amount,
    count: g.count,
    percentage: catTotalAmount > 0 ? Math.round((g.amount / catTotalAmount) * 1000) / 10 : 0,
  }));

  const categoryInsights: string[] = [];
  if (categoriesBreakdown.length > 0) {
    const topCat = categoriesBreakdown[0];
    categoryInsights.push(
      `Your largest expense is ${topCat.name}, representing ${topCat.percentage}% of your spending.`
    );
  }

  // Process budgets and actual spending
  const spendMap = new Map<string, number>(
    (budgetExpensesRaw as any[]).map((e) => [e._id.toString(), e.total])
  );

  const budgetsWithSpend = (userBudgetsRaw as any[]).map((b) => {
    const categoryId = b.categoryId?._id?.toString() || b.categoryId?.toString();
    const spent = spendMap.get(categoryId) || 0;
    const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
    return {
      id: b._id.toString(),
      limit: b.limit,
      month: b.month,
      year: b.year,
      userId: b.userId.toString(),
      categoryId,
      category: b.categoryId
        ? {
            id: b.categoryId._id?.toString() ?? b.categoryId.toString(),
            name: b.categoryId.name,
            color: b.categoryId.color,
            icon: b.categoryId.icon,
            type: b.categoryId.type,
          }
        : null,
      spent,
      remaining: Math.max(0, b.limit - spent),
      percentage: Math.min(100, Math.round(percentage * 10) / 10),
      rawPercentage: Math.round(percentage * 10) / 10,
      isWarning: percentage >= 80 && percentage < 100,
      isExceeded: percentage >= 100,
    };
  });

  return {
    summary: {
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
    },
    monthlyTrend: {
      "12M": monthlyTrend12M,
      "30D": dailyTrend30D,
      "7D": dailyTrend7D,
    },
    categoryBreakdown: {
      type: "EXPENSE",
      totalAmount: catTotalAmount,
      categories: categoriesBreakdown,
      insights: categoryInsights,
    },
    budgets: budgetsWithSpend,
    dbConnectMs,
    queryMs,
  };
}

/**
 * Cached version of the dashboard fetcher using Next.js unstable_cache
 * Keyed by userId and tagged for granular invalidation on mutations.
 */
function getCachedDashboard(userId: string) {
  return unstable_cache(
    async () => fetchDashboardData(userId),
    [`dashboard-${userId}`],
    {
      revalidate: 60, // 60-second automatic background revalidation
      tags: [`dashboard-${userId}`],
    }
  )();
}

export async function GET(req: Request) {
  const t0 = Date.now();

  try {
    const tAuth0 = Date.now();
    const session = await auth();
    const authMs = Date.now() - tAuth0;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await getCachedDashboard(userId);
    const totalMs = Date.now() - t0;

    return NextResponse.json(
      {
        ...data,
        timing: {
          authMs,
          dbConnectMs: data.dbConnectMs,
          queryMs: data.queryMs,
          totalMs,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300",
          "X-Response-Time": `${totalMs}ms`,
        },
      }
    );
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

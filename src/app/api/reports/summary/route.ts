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
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    await connectDB();

    const [allIncome, allExpense, currentMonthTxs, lastMonthTxs, recentTransactions] =
      await Promise.all([
        Transaction.aggregate([
          { $match: { userId, type: "INCOME" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Transaction.aggregate([
          { $match: { userId, type: "EXPENSE" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Transaction.find({
          userId,
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        })
          .select("amount type")
          .lean(),
        Transaction.find({
          userId,
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        })
          .select("amount type")
          .lean(),
        Transaction.find({ userId })
          .populate("categoryId", "name color icon type")
          .sort({ date: -1 })
          .limit(6)
          .lean(),
      ]);

    const totalIncomeAllTime = allIncome[0]?.total || 0;
    const totalExpenseAllTime = allExpense[0]?.total || 0;
    const totalBalance = totalIncomeAllTime - totalExpenseAllTime;

    let currentIncome = 0;
    let currentExpense = 0;
    for (const tx of currentMonthTxs) {
      if (tx.type === "INCOME") currentIncome += tx.amount;
      else currentExpense += tx.amount;
    }

    let lastIncome = 0;
    let lastExpense = 0;
    for (const tx of lastMonthTxs) {
      if (tx.type === "INCOME") lastIncome += tx.amount;
      else lastExpense += tx.amount;
    }

    const currentNetSavings = currentIncome - currentExpense;
    const lastNetSavings = lastIncome - lastExpense;
    const savingsRate =
      currentIncome > 0
        ? Math.max(0, Math.min(100, (currentNetSavings / currentIncome) * 100))
        : 0;

    const incomeDelta = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseDelta = lastExpense > 0 ? ((currentExpense - lastExpense) / lastExpense) * 100 : 0;
    const savingsDelta =
      lastNetSavings !== 0
        ? ((currentNetSavings - lastNetSavings) / Math.abs(lastNetSavings)) * 100
        : 0;

    const normalizedRecent = (recentTransactions as any[]).map((t) => ({
      id: t._id.toString(),
      amount: t.amount,
      type: t.type,
      note: t.note || null,
      date: t.date,
      recurring: t.recurring,
      userId: t.userId.toString(),
      categoryId: t.categoryId?._id?.toString() || t.categoryId?.toString(),
      category: t.categoryId
        ? {
            id: t.categoryId._id?.toString() || t.categoryId.toString(),
            name: t.categoryId.name,
            color: t.categoryId.color,
            icon: t.categoryId.icon,
            type: t.categoryId.type,
          }
        : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json({
      totalBalance,
      currentMonth: {
        income: currentIncome,
        expense: currentExpense,
        netSavings: currentNetSavings,
        savingsRate: Math.round(savingsRate * 10) / 10,
      },
      lastMonth: {
        income: lastIncome,
        expense: lastExpense,
        netSavings: lastNetSavings,
      },
      deltas: {
        income: Math.round(incomeDelta * 10) / 10,
        expense: Math.round(expenseDelta * 10) / 10,
        savings: Math.round(savingsDelta * 10) / 10,
      },
      recentTransactions: normalizedRecent,
    });
  } catch (error) {
    console.error("Reports summary error:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}

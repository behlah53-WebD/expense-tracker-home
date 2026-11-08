/**
 * GET /api/reports/summary
 *
 * Before (5 separate queries, 2 full-collection scans):
 *   • allIncome aggregate   – scans ALL INCOME transactions ever
 *   • allExpense aggregate  – scans ALL EXPENSE transactions ever
 *   • currentMonthTxs find – selects only amount+type ✓
 *   • lastMonthTxs find    – selects only amount+type ✓
 *   • recentTransactions   – populate + limit 6 ✓
 *
 * After (3 queries, all index-covered):
 *   • single aggregate for all-time balance + current-month + last-month buckets
 *   • recentTransactions (populate + limit 6)  — unchanged, already fast
 *   Both run in Promise.all.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
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
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    await connectDB();

    // ── Single aggregation replaces 4 separate queries ────────────────────
    // Uses indexes: { userId:1, type:1, date:-1 } and { userId:1, date:-1 }
    const [buckets, recentTransactions] = await Promise.all([
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

      Transaction.find({ userId })
        .select("amount type note date recurring categoryId userId createdAt updatedAt")
        .populate("categoryId", "name color icon type")
        .sort({ date: -1 })
        .limit(6)
        .lean(),
    ]);

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
    });
  } catch (error) {
    console.error("Reports summary error:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}

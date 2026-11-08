import mongoose from "mongoose";
import connectDB from "../src/lib/mongodb";
import Transaction from "../src/lib/models/Transaction";
import Category from "../src/lib/models/Category";
import Budget from "../src/lib/models/Budget";
import User from "../src/lib/models/User";

async function verify() {
  console.log("=== STEP 14 VERIFICATION: AFTER OPTIMIZATIONS ===");
  void User;
  void Category;
  void Budget;
  void Transaction;

  // 1. Database Connection: Cold vs Warm
  const tWarm0 = Date.now();
  await connectDB();
  const warmConnectMs = Date.now() - tWarm0;
  console.log(`DB Connect (Warm / Cached globalThis): ${warmConnectMs} ms`);

  const user = await User.findOne({ email: "demo@auroraledger.com" }).lean();
  if (!user) {
    console.error("User demo@auroraledger.com not found!");
    process.exit(1);
  }
  const userId = user._id;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
  const twelveMonthsAgo = new Date(currentYear, currentMonth - 11, 1);

  // 2. Measure Unified Parallel Dashboard Pipeline
  const tUnified0 = Date.now();
  const [
    buckets,
    recentTransactionsRaw,
    twelveMonthsTxs,
    categoryAggregation,
    userBudgetsRaw,
    budgetExpensesRaw,
  ] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0] } },
          currentIncome: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$type", "INCOME"] }, { $gte: ["$date", startOfCurrentMonth] }] },
                "$amount",
                0,
              ],
            },
          },
          currentExpense: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$type", "EXPENSE"] }, { $gte: ["$date", startOfCurrentMonth] }] },
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

    Transaction.find({ userId, date: { $gte: twelveMonthsAgo } })
      .select("amount type date")
      .sort({ date: 1 })
      .lean(),

    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "EXPENSE",
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      { $group: { _id: "$categoryId", amount: { $sum: "$amount" }, count: { $sum: 1 } } },
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

    Budget.find({ userId, month: currentMonth + 1, year: currentYear })
      .populate("categoryId", "name color icon type")
      .lean(),

    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "EXPENSE",
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
    ]),
  ]);
  const unifiedQueryMs = Date.now() - tUnified0;
  console.log(`Unified Dashboard Queries (All 6 parallel): ${unifiedQueryMs} ms`);

  // Simple read test (e.g., categories list or user query)
  const tSimple0 = Date.now();
  await Category.find({ userId, type: "EXPENSE" }).select("name color icon").lean();
  const simpleReadMs = Date.now() - tSimple0;
  console.log(`Simple Read Query (Categories list): ${simpleReadMs} ms`);

  // Response Payload Size
  const unifiedPayload = {
    summary: {
      totalBalance: 120000,
      currentMonth: { income: 50000, expense: 20000, netSavings: 30000, savingsRate: 60 },
      lastMonth: { income: 45000, expense: 18000, netSavings: 27000 },
      deltas: { income: 11.1, expense: 11.1, savings: 11.1 },
      recentTransactions: recentTransactionsRaw,
    },
    monthlyTrend: twelveMonthsTxs,
    categoryBreakdown: categoryAggregation,
    budgets: userBudgetsRaw,
  };
  const unifiedSize = Buffer.byteLength(JSON.stringify(unifiedPayload));
  console.log(`Unified /api/dashboard Payload Size: ${unifiedSize} bytes (~${(unifiedSize / 1024).toFixed(2)} KB)`);

  await mongoose.disconnect();
}

verify().catch(console.error);


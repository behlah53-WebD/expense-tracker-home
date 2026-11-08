import mongoose from "mongoose";
import connectDB from "../src/lib/mongodb";
import Transaction from "../src/lib/models/Transaction";
import Category from "../src/lib/models/Category";
import Budget from "../src/lib/models/Budget";
import User from "../src/lib/models/User";

async function audit() {
  console.log("=== STEP 0 AUDIT: BENCHMARKING BEFORE OPTIMIZATIONS ===");
  // Force model registration
  void User;
  void Category;
  void Budget;
  void Transaction;

  const tConnectCold0 = Date.now();
  await connectDB();
  const connectColdMs = Date.now() - tConnectCold0;

  const tConnectWarm0 = Date.now();
  await connectDB();
  const connectWarmMs = Date.now() - tConnectWarm0;

  console.log(`DB Connect: Cold = ${connectColdMs} ms, Warm = ${connectWarmMs} ms`);

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
  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // Measure Query 1: Bucket Aggregation (Summary)
  const q1Start = Date.now();
  const buckets = await Transaction.aggregate([
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
  ]);
  const q1Time = Date.now() - q1Start;
  console.log(`Query 1 (Summary Buckets Aggregation): ${q1Time} ms`);

  // Measure Query 2: Recent Transactions (find + populate + limit 6)
  const q2Start = Date.now();
  const recentTx = await Transaction.find({ userId })
    .select("amount type note date recurring categoryId userId createdAt updatedAt")
    .populate("categoryId", "name color icon type")
    .sort({ date: -1 })
    .limit(6)
    .lean();
  const q2Time = Date.now() - q2Start;
  console.log(`Query 2 (Recent Transactions find + populate): ${q2Time} ms`);

  // Measure Query 3: Monthly Trend (find 12 months)
  const q3Start = Date.now();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const tx12M = await Transaction.find({ userId, date: { $gte: twelveMonthsAgo } })
    .select("amount type date")
    .sort({ date: 1 })
    .lean();
  const q3Time = Date.now() - q3Start;
  console.log(`Query 3 (Monthly Trend find 12M): ${q3Time} ms`);

  // Measure Query 4: Category Breakdown ($match + $group + $lookup + $unwind)
  const q4Start = Date.now();
  const catBreakdown = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: "EXPENSE",
        date: {
          $gte: startOfCurrentMonth,
          $lte: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999),
        },
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
  ]);
  const q4Time = Date.now() - q4Start;
  console.log(`Query 4 (Category Breakdown Aggregation): ${q4Time} ms`);

  // Measure Query 5: Budgets + Spend aggregation
  const q5Start = Date.now();
  const [budgets, spendAgg] = await Promise.all([
    Budget.find({ userId, month: currentMonth + 1, year: currentYear })
      .populate("categoryId", "name color icon type")
      .lean(),
    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "EXPENSE",
          date: {
            $gte: startOfCurrentMonth,
            $lte: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999),
          },
        },
      },
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
    ]),
  ]);
  const q5Time = Date.now() - q5Start;
  console.log(`Query 5 (Budgets + Spend Aggregation): ${q5Time} ms`);

  console.log(`Sum of queries if run sequentially (waterfall): ${q1Time + q2Time + q3Time + q4Time + q5Time} ms`);

  // Parallel execution of all 5
  const parStart = Date.now();
  await Promise.all([
    Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0] } },
        },
      },
    ]),
    Transaction.find({ userId }).select("amount date").sort({ date: -1 }).limit(6).lean(),
    Transaction.find({ userId, date: { $gte: twelveMonthsAgo } }).select("amount date").lean(),
    Transaction.aggregate([
      { $match: { userId, type: "EXPENSE" } },
      { $group: { _id: "$categoryId", amount: { $sum: "$amount" } } },
    ]),
    Budget.find({ userId, month: currentMonth + 1, year: currentYear }).lean(),
  ]);
  const parTime = Date.now() - parStart;
  console.log(`Parallel execution of queries: ${parTime} ms`);

  // Response size calculations
  console.log("Estimated Payload Sizes (raw JSON uncompressed):");
  const szSummary = Buffer.byteLength(JSON.stringify({ buckets, recentTx }));
  const szMonthly = Buffer.byteLength(JSON.stringify(tx12M));
  const szCategories = Buffer.byteLength(JSON.stringify(catBreakdown));
  const szBudgets = Buffer.byteLength(JSON.stringify({ budgets, spendAgg }));
  console.log(`  /api/reports/summary: ${szSummary} bytes (~${(szSummary / 1024).toFixed(2)} KB)`);
  console.log(`  /api/reports/monthly: ${szMonthly} bytes (~${(szMonthly / 1024).toFixed(2)} KB)`);
  console.log(`  /api/reports/categories: ${szCategories} bytes (~${(szCategories / 1024).toFixed(2)} KB)`);
  console.log(`  /api/budgets: ${szBudgets} bytes (~${(szBudgets / 1024).toFixed(2)} KB)`);
  console.log(`  Total across 4 calls: ${szSummary + szMonthly + szCategories + szBudgets} bytes (~${((szSummary + szMonthly + szCategories + szBudgets) / 1024).toFixed(2)} KB)`);

  await mongoose.disconnect();
}

audit().catch(console.error);

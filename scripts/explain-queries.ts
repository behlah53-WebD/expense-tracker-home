/**
 * scripts/explain-queries.ts
 *
 * Run this script to get query plans for the slowest queries.
 * Usage: npx tsx scripts/explain-queries.ts
 *
 * Output: a JSON file with execution stats for each key query.
 */

import mongoose from "mongoose";
import { writeFileSync } from "fs";
import { join } from "path";

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: "expensetracker" });
  const db = mongoose.connection.db!;

  console.log("Connected. Running explain() on key queries...\n");

  // Use a real userId from your DB for meaningful explain output.
  // Replace this with an actual ObjectId from your transactions collection.
  const SAMPLE_USER_ID = new mongoose.Types.ObjectId("000000000000000000000001");

  const queries: Array<{ name: string; collection: string; filter: object; sort?: object }> = [
    {
      name: "transactions_paginated_date_desc",
      collection: "transactions",
      filter: { userId: SAMPLE_USER_ID },
      sort: { date: -1 },
    },
    {
      name: "transactions_type_date",
      collection: "transactions",
      filter: { userId: SAMPLE_USER_ID, type: "EXPENSE" },
      sort: { date: -1 },
    },
    {
      name: "transactions_summary_all_income",
      collection: "transactions",
      filter: { userId: SAMPLE_USER_ID, type: "INCOME" },
    },
    {
      name: "categories_by_userId_type",
      collection: "categories",
      filter: { userId: SAMPLE_USER_ID, type: "EXPENSE" },
      sort: { name: 1 },
    },
    {
      name: "budgets_by_month_year",
      collection: "budgets",
      filter: { userId: SAMPLE_USER_ID, month: 11, year: 2026 },
    },
  ];

  const results: Record<string, object> = {};

  for (const q of queries) {
    const coll = db.collection(q.collection);
    const explainCmd: Record<string, unknown> = {
      find: q.collection,
      filter: q.filter,
      ...(q.sort ? { sort: q.sort } : {}),
      limit: 10,
    };

    const plan = await db.command({
      explain: explainCmd,
      verbosity: "executionStats",
    });

    const stats = plan.executionStats ?? {};
    console.log(`\n── ${q.name} ──`);
    console.log(`  winningPlan stage    : ${plan.queryPlanner?.winningPlan?.stage}`);
    console.log(`  indexName            : ${plan.queryPlanner?.winningPlan?.inputStage?.indexName ?? "COLLSCAN ⚠️"}`);
    console.log(`  nReturned            : ${stats.nReturned}`);
    console.log(`  totalDocsExamined    : ${stats.totalDocsExamined}`);
    console.log(`  totalKeysExamined    : ${stats.totalKeysExamined}`);
    console.log(`  executionTimeMillis  : ${stats.executionTimeMillis} ms`);

    results[q.name] = {
      indexUsed: plan.queryPlanner?.winningPlan?.inputStage?.indexName ?? "COLLSCAN",
      nReturned: stats.nReturned,
      docsExamined: stats.totalDocsExamined,
      keysExamined: stats.totalKeysExamined,
      executionTimeMillis: stats.executionTimeMillis,
    };
  }

  const outPath = join(process.cwd(), "explain-results.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results written to ${outPath}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


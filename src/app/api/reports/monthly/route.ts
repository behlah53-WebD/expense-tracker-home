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

    await connectDB();

    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: twelveMonthsAgo },
    })
      .select("amount type date")
      .sort({ date: 1 })
      .lean();

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    // Build 12-month buckets
    const monthlyMap = new Map<string, { label: string; monthKey: string; income: number; expense: number; net: number }>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      monthlyMap.set(key, { label, monthKey: key, income: 0, expense: 0, net: 0 });
    }

    // 30-day buckets
    const daily30Map = new Map<string, { label: string; income: number; expense: number; net: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayKey = d.toISOString().split("T")[0];
      const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      daily30Map.set(dayKey, { label, income: 0, expense: 0, net: 0 });
    }

    for (const tx of transactions as any[]) {
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

    const monthlyData = Array.from(monthlyMap.values());
    const thirtyDaysData = Array.from(daily30Map.values());
    const sevenDaysData = thirtyDaysData.slice(-7);

    return NextResponse.json({
      "12M": monthlyData,
      "30D": thirtyDaysData,
      "7D": sevenDaysData,
    });
  } catch (error) {
    console.error("Reports monthly error:", error);
    return NextResponse.json({ error: "Failed to fetch monthly reports" }, { status: 500 });
  }
}

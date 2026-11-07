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

    await connectDB();

    const transactions = await Transaction.find({
      userId: new mongoose.Types.ObjectId(session.user.id),
    })
      .populate("categoryId", "name")
      .sort({ date: -1 })
      .lean();

    const escapeCSV = (value: string | number | null | undefined): string => {
      if (value === null || value === undefined) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const header = ["Date", "Type", "Category", "Amount", "Currency", "Note", "Recurring"].join(",");
    const rows = (transactions as any[]).map((t) => {
      const dateStr = new Date(t.date).toISOString().split("T")[0];
      return [
        escapeCSV(dateStr),
        escapeCSV(t.type),
        escapeCSV(t.categoryId?.name || "Uncategorized"),
        escapeCSV(t.amount.toFixed(2)),
        escapeCSV((session.user as any).currency || "INR"),
        escapeCSV(t.note || ""),
        escapeCSV(t.recurring ? "Yes" : "No"),
      ].join(",");
    });

    const csvContent = [header, ...rows].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Expense Tracker_ledger_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}

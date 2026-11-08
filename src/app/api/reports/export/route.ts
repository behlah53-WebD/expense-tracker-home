/**
 * GET /api/reports/export
 *
 * Before: Transaction.find({userId}) – unbounded, loads ALL docs into RAM
 *
 * After:  Streams rows using a Mongoose cursor so memory stays flat even
 *         for users with thousands of transactions.
 *         Hard cap at 50 000 rows to prevent runaway responses.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";   // streaming requires Node runtime, not Edge

const MAX_ROWS = 50_000;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const currency = (session.user as any).currency || "INR";
    const dateStr = new Date().toISOString().split("T")[0];

    const escapeCSV = (v: string | number | boolean | null | undefined): string => {
      if (v === null || v === undefined) return '""';
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };

    const header = ["Date", "Type", "Category", "Amount", "Currency", "Note", "Recurring"].join(",");

    // ReadableStream: iterate a Mongoose cursor so we never materialise the
    // full result set in memory.
    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(header + "\r\n"));

        const cursor = Transaction.find({ userId })
          .select("amount type note date recurring categoryId")
          .populate("categoryId", "name")
          .sort({ date: -1 })
          .limit(MAX_ROWS)
          .lean()
          .cursor();

        for await (const t of cursor as any) {
          const row = [
            escapeCSV(new Date(t.date).toISOString().split("T")[0]),
            escapeCSV(t.type),
            escapeCSV((t.categoryId as any)?.name || "Uncategorized"),
            escapeCSV(Number(t.amount).toFixed(2)),
            escapeCSV(currency),
            escapeCSV(t.note || ""),
            escapeCSV(t.recurring ? "Yes" : "No"),
          ].join(",");
          controller.enqueue(enc.encode(row + "\r\n"));
        }

        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="aurora_ledger_${dateStr}.csv"`,
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}

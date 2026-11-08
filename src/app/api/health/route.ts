/**
 * GET /api/health
 *
 * Keep-warm + readiness probe.
 *
 * Purpose:
 *  1. Keeps the MongoDB connection pool alive so the first real request
 *     after a cold/idle period isn't penalised by a fresh TCP handshake.
 *  2. Lets uptime monitors (UptimeRobot, BetterUptime, Vercel Crons) ping
 *     a cheap endpoint that also validates DB connectivity.
 *
 * Deployment options:
 *  - Vercel Cron (vercel.json): run every 5 minutes during business hours.
 *  - External monitor: ping every 60 s.
 *
 * Response time breakdown is included so you can distinguish:
 *   dbConnectMs  → how long it took to get the cached/new connection
 *   pingMs       → how long the actual round-trip DB ping took
 */

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET() {
  const start = Date.now();

  try {
    const t1 = Date.now();
    await connectDB();
    const dbConnectMs = Date.now() - t1;

    // A lightweight admin ping (requires no collection scan)
    const t2 = Date.now();
    await mongoose.connection.db!.admin().ping();
    const pingMs = Date.now() - t2;

    const totalMs = Date.now() - start;

    return NextResponse.json(
      {
        status: "ok",
        dbState: mongoose.connection.readyState, // 1 = connected
        timing: { dbConnectMs, pingMs, totalMs },
        ts: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Response-Time": `${totalMs}ms`,
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[Health] DB check failed:", message);

    return NextResponse.json(
      {
        status: "error",
        error: message,
        totalMs: Date.now() - start,
        ts: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}


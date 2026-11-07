"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { MonthlyTrendData } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/utils";

interface GlowingCashFlowProps {
  data?: MonthlyTrendData;
  currency?: string;
}

export function GlowingCashFlow({
  data,
  currency = "INR",
}: GlowingCashFlowProps) {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "12M">("12M");

  const chartPoints = data ? data[timeframe] || [] : [];

  return (
    <GlassCard className="h-full flex flex-col justify-between">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[15px] font-semibold font-heading text-[var(--text-heading)] flex items-center gap-2">
            <span>Glowing Cash Flow</span>
            <span
              className="w-2 h-2 rounded-full bg-[var(--income)] shadow-glow-mint"
              aria-hidden="true"
            />
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Real-time income and expense trajectory
          </p>
        </div>

        {/* Legend & Segmented Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span
                className="w-2.5 h-2.5 rounded-full bg-[var(--income)] shadow-glow-mint"
                aria-hidden="true"
              />
              Income
            </span>
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span
                className="w-2.5 h-2.5 rounded-full bg-[var(--expense)] shadow-glow-coral"
                aria-hidden="true"
              />
              Expense
            </span>
          </div>

          <div className="p-1 rounded-inner bg-[var(--surface)] border border-[var(--border)] flex items-center gap-1">
            {(["7D", "30D", "12M"] as const).map(period => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === period
                    ? "bg-[var(--primary)] text-white shadow-glow-violet"
                    : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Area Chart Container */}
      <div className="h-72 w-full">
        {chartPoints.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
            Loading cash flow stream...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartPoints}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {/* Income Area Gradient */}
                <linearGradient
                  id="auroraIncomeGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#2EF2B0" stopOpacity={0.35} />
                  <stop offset="90%" stopColor="#2EF2B0" stopOpacity={0.0} />
                </linearGradient>

                {/* Expense Area Gradient */}
                <linearGradient
                  id="auroraExpenseGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#FF5C8A" stopOpacity={0.3} />
                  <stop offset="90%" stopColor="#FF5C8A" stopOpacity={0.0} />
                </linearGradient>

                {/* SVG Glow Filter for Income Line */}
                <filter
                  id="glowIncomeLine"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="4"
                    floodColor="#2EF2B0"
                    floodOpacity="0.8"
                  />
                </filter>

                {/* SVG Glow Filter for Expense Line */}
                <filter
                  id="glowExpenseLine"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="4"
                    floodColor="#FF5C8A"
                    floodOpacity="0.8"
                  />
                </filter>
              </defs>

              <XAxis
                dataKey="label"
                stroke="var(--border)"
                tick={{ fill: "#A5ADD6", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--border)"
                tick={{ fill: "#8A92BA", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={val => `₹${(val / 1000).toFixed(0)}k`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const incomeVal = Number(
                      payload.find(p => p.dataKey === "income")?.value || 0
                    );
                    const expenseVal = Number(
                      payload.find(p => p.dataKey === "expense")?.value || 0
                    );
                    const netVal = incomeVal - expenseVal;

                    return (
                      <div className="glass-card p-3 shadow-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/95 text-xs space-y-1.5 min-w-[150px]">
                        <p className="font-semibold text-[var(--text-heading)] border-b border-[var(--border)] pb-1">
                          {label}
                        </p>
                        <div className="flex items-center justify-between text-[var(--income-text)]">
                          <span>Income:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(incomeVal, currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[var(--expense-text)]">
                          <span>Expense:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(expenseVal, currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]">
                          <span>Net:</span>
                          <span
                            className={`font-mono font-bold ${
                              netVal >= 0
                                ? "text-[var(--income-text)]"
                                : "text-[var(--danger)]"
                            }`}
                          >
                            {formatCurrency(netVal, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="income"
                stroke="#2EF2B0"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#auroraIncomeGrad)"
                filter="url(#glowIncomeLine)"
                animationDuration={1000}
                animationEasing="ease-out"
              />

              <Area
                type="monotone"
                dataKey="expense"
                stroke="#FF6B95"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#auroraExpenseGrad)"
                filter="url(#glowExpenseLine)"
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

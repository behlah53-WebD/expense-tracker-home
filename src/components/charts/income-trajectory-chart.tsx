"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface IncomeTrajectoryChartProps {
  data: Array<{ label: string; income: number }>;
  currency?: string;
}

export function IncomeTrajectoryChart({
  data,
  currency = "INR",
}: IncomeTrajectoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
        No inflow data available...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--aurora-mint)"
              stopOpacity={0.9}
            />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          stroke="var(--border)"
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--border)"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={val => `${(val / 1000).toFixed(0)}k`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="glass-card p-3 bg-[var(--bg-elevated)] border border-[var(--border)] text-xs shadow-xl rounded-xl">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {label}
                  </p>
                  <p className="font-mono font-bold text-income mt-1">
                    {formatCurrency(Number(payload[0].value), currency)}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="income"
          fill="url(#incomeBarGrad)"
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

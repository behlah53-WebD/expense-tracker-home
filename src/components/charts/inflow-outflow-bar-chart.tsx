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

interface InflowOutflowBarChartProps {
  data: Array<{ label: string; income: number; expense: number }>;
  currency?: string;
}

export function InflowOutflowBarChart({
  data,
  currency = "INR",
}: InflowOutflowBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading comparative cash flow...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
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
              const inc = Number(
                payload.find(p => p.dataKey === "income")?.value || 0
              );
              const exp = Number(
                payload.find(p => p.dataKey === "expense")?.value || 0
              );
              return (
                <div className="glass-card p-3 bg-[var(--bg-elevated)] border border-[var(--border)] text-xs shadow-xl rounded-xl">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {label}
                  </p>
                  <p className="text-income font-mono mt-1">
                    Income: {formatCurrency(inc, currency)}
                  </p>
                  <p className="text-expense font-mono">
                    Expense: {formatCurrency(exp, currency)}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="income"
          fill="var(--aurora-mint)"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="expense"
          fill="var(--aurora-coral)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

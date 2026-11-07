"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface NetSavingsLineChartProps {
  data: Array<{ label: string; net: number }>;
  currency?: string;
}

export function NetSavingsLineChart({
  data,
  currency = "INR",
}: NetSavingsLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading net surplus trend...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <filter id="netLineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="4"
              floodColor="var(--primary)"
              floodOpacity="0.8"
            />
          </filter>
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
              const val = Number(payload[0].value);
              return (
                <div className="glass-card p-3 bg-[var(--bg-elevated)] border border-[var(--border)] text-xs shadow-xl rounded-xl">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {label}
                  </p>
                  <p
                    className={`font-mono font-bold mt-1 tabular-nums ${val >= 0 ? "text-income" : "text-expense"}`}
                  >
                    Net Surplus: {formatCurrency(val, currency)}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke="var(--primary)"
          strokeWidth={3.5}
          dot={{ r: 4, fill: "var(--aurora-cyan)" }}
          filter="url(#netLineGlow)"
          animationDuration={1200}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

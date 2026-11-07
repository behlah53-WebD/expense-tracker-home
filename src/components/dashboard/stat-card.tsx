"use client";

import React, { useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { CountUpAmount } from "@/components/ui/count-up-amount";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  amount: number;
  delta?: number;
  deltaPeriod?: string;
  type: "income" | "expense" | "neutral";
  icon: React.ReactNode;
  sparklineData?: number[];
  currency?: string;
}

function StatCardBase({
  title,
  amount,
  delta = 0,
  deltaPeriod = "vs last month",
  type,
  icon,
  sparklineData = [30, 45, 38, 52, 48, 65, 59],
  currency = "INR",
}: StatCardProps) {
  const isPositive = delta >= 0;
  const isIncome = type === "income";

  const colorConfig = useMemo(() => {
    return {
      income: {
        gradient: "from-[var(--income)] to-[var(--income-deep)]",
        glow: "rgba(46, 242, 176, 0.2)",
        textClass: "text-[var(--income-text)]",
        stroke: "var(--income)",
      },
      expense: {
        gradient: "from-[var(--expense)] to-[var(--expense-deep)]",
        glow: "rgba(255, 92, 138, 0.2)",
        textClass: "text-[var(--expense-text)]",
        stroke: "var(--expense)",
      },
      neutral: {
        gradient: "from-[var(--primary)] to-[var(--accent-cyan)]",
        glow: "rgba(124, 92, 255, 0.2)",
        textClass: "text-[var(--accent-cyan)]",
        stroke: "var(--accent-cyan)",
      },
    }[type];
  }, [type]);

  const width = 100;
  const height = 36;

  // Memoize SVG mini sparkline path
  const points = useMemo(() => {
    if (!sparklineData || sparklineData.length === 0) return "";
    const minVal = Math.min(...sparklineData);
    const maxVal = Math.max(...sparklineData);
    const range = maxVal - minVal || 1;
    return sparklineData
      .map((val, idx) => {
        const x = (idx / (sparklineData.length - 1)) * width;
        const y = height - ((val - minVal) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(" ");
  }, [sparklineData]);

  return (
    <GlassCard
      spotlightColor={colorConfig.glow}
      className="h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
            {title}
          </span>
          <div className="mt-2 text-2xl md:text-3xl font-bold font-heading text-[var(--text-heading)]">
            <CountUpAmount amount={amount} currency={currency} />
          </div>
        </div>

        {/* Gradient Icon Badge */}
        <div
          className={cn(
            "w-11 h-11 rounded-inner bg-gradient-to-tr flex items-center justify-center text-white shadow-md shrink-0",
            colorConfig.gradient
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between pt-3 border-t border-[var(--border)]">
        {/* Delta Pill */}
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-semibold px-2 py-0.5 rounded-full",
              isIncome
                ? isPositive
                  ? "bg-[var(--income)]/15 text-[var(--income-text)]"
                  : "bg-[var(--expense)]/15 text-[var(--expense-text)]"
                : isPositive
                ? "bg-[var(--expense)]/15 text-[var(--expense-text)]"
                : "bg-[var(--income)]/15 text-[var(--income-text)]"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3 h-3" aria-hidden="true" />
            )}
            {Math.abs(delta)}%
          </span>
          <span className="text-[11px] text-[var(--text-muted)] truncate">{deltaPeriod}</span>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="w-24 h-8 overflow-hidden" aria-hidden="true">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={colorConfig.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </GlassCard>
  );
}

export const StatCard = React.memo(StatCardBase);

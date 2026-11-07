"use client";

import React, { useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, Sparkles } from "lucide-react";

interface SavingsRingProps {
  savingsRate: number; // e.g. 34.5%
  netSavings: number;
  currency?: string;
}

function SavingsRingBase({
  savingsRate,
  netSavings,
  currency = "INR",
}: SavingsRingProps) {
  const animatedRate = useCountUp(savingsRate, 800, 1);

  // SVG Circular progress math
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedRate = Math.max(0, Math.min(100, savingsRate));

  const strokeDashoffset = useMemo(() => {
    return circumference - (clampedRate / 100) * circumference;
  }, [circumference, clampedRate]);

  return (
    <GlassCard
      spotlightColor="rgba(255, 200, 87, 0.2)"
      className="h-full flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Savings Rate
          </span>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Retained this month
          </p>
        </div>
        <div className="w-10 h-10 rounded-inner bg-gradient-to-tr from-[var(--accent-gold)] to-[var(--expense-deep)] flex items-center justify-center text-white shadow-md">
          <PiggyBank className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
      </div>

      <div className="flex items-center justify-center py-3 relative">
        <div className="relative w-[120px] h-[120px] flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id="goldRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-gold)" />
                <stop offset="100%" stopColor="var(--expense-deep)" />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--border)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Glowing Gold Gradient Progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#goldRingGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
            />
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-bold font-mono text-[var(--text-heading)]">
              {animatedRate}%
            </span>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-gold)] tracking-wider">
              Target 20%+
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[var(--text-gold)]" aria-hidden="true" /> Net Saved
        </span>
        <span className="font-mono font-semibold text-[var(--text-heading)]">
          {formatCurrency(Math.max(0, netSavings), currency)}
        </span>
      </div>
    </GlassCard>
  );
}

export const SavingsRing = React.memo(SavingsRingBase);

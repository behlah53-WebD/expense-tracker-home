"use client";

import React from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency } from "@/lib/utils";

interface CountUpAmountProps {
  amount: number;
  currency?: string;
  duration?: number;
  className?: string;
  prefix?: string;
  compact?: boolean;
}

function CountUpAmountBase({
  amount,
  currency = "INR",
  duration = 800,
  className = "",
  prefix = "",
  compact = false,
}: CountUpAmountProps) {
  const animatedAmount = useCountUp(amount, duration, 2);

  return (
    <span
      className={`font-mono tabular-nums whitespace-nowrap ${className}`}
      data-amount={amount}
    >
      {prefix}
      {formatCurrency(animatedAmount, currency, compact)}
    </span>
  );
}

export const CountUpAmount = React.memo(CountUpAmountBase);

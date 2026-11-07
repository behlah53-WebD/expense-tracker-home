"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { useBudgets } from "@/hooks/useBudgets";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight, Target, AlertTriangle } from "lucide-react";

export function BudgetProgressCard({
  currency = "INR",
}: {
  currency?: string;
}) {
  const { data, isLoading } = useBudgets();
  const budgets = data?.budgets || [];

  return (
    <GlassCard className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold font-heading text-[var(--text-heading)] flex items-center gap-2">
              <span>Category Budgets</span>
              <Target
                className="w-4 h-4 text-[var(--primary)]"
                aria-hidden="true"
              />
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Spending thresholds for this month
            </p>
          </div>

          <Link
            href="/settings"
            className="text-xs text-[var(--primary)] hover:text-[var(--primary-glow)] flex items-center gap-0.5 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded-md"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)] animate-pulse">
            Loading budget parameters...
          </div>
        ) : budgets.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No active budgets set for this month. Set one in Settings!
          </div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {budgets.map(b => {
              const isExceeded = b.isExceeded;
              const isWarning = b.isWarning;

              const barColor = isExceeded
                ? "bg-gradient-to-r from-[var(--danger)] to-[var(--expense-deep)] shadow-glow-coral"
                : isWarning
                  ? "bg-gradient-to-r from-[var(--accent-gold)] to-[var(--expense-deep)]"
                  : "bg-gradient-to-r from-[var(--primary)] to-[var(--accent-cyan)] shadow-glow-violet";

              const badgeText = isExceeded
                ? "Exceeded"
                : isWarning
                  ? "80%+ Warning"
                  : `${b.percentage}%`;

              const badgeStyle = isExceeded
                ? "bg-[var(--danger)]/20 text-[var(--danger)]"
                : isWarning
                  ? "bg-[var(--accent-gold)]/20 text-[var(--text-gold)]"
                  : "bg-[var(--primary)]/20 text-[var(--primary-glow)]";

              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${b.category.color}25`,
                          color: b.category.color,
                        }}
                      >
                        <CategoryIcon
                          name={b.category.icon}
                          className="w-3.5 h-3.5"
                        />
                      </div>
                      <span className="font-medium text-[var(--text-heading)]">
                        {b.category.name}
                      </span>
                      {isExceeded && (
                        <AlertTriangle
                          className="w-3.5 h-3.5 text-[var(--danger)]"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[var(--text-muted)]">
                        <strong className="text-[var(--text-heading)] font-semibold">
                          {formatCurrency(b.spent, currency, true)}
                        </strong>{" "}
                        / {formatCurrency(b.limit, currency, true)}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${badgeStyle}`}
                      >
                        {badgeText}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[var(--surface-hover)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-aurora ${barColor}`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

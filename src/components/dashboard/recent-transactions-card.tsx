"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { TransactionWithCategory } from "@/hooks/useTransactions";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { ArrowUpRight, ArrowLeftRight } from "lucide-react";

interface RecentTransactionsCardProps {
  transactions?: TransactionWithCategory[];
  currency?: string;
}

export function RecentTransactionsCard({
  transactions = [],
  currency = "INR",
}: RecentTransactionsCardProps) {
  return (
    <GlassCard className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold font-heading text-[var(--text-heading)] flex items-center gap-2">
              <span>Recent Activity</span>
              <ArrowLeftRight className="w-4 h-4 text-[var(--accent-cyan)]" aria-hidden="true" />
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Latest recorded inflows and outflows
            </p>
          </div>

          <Link
            href="/transactions"
            className="text-xs text-[var(--primary)] hover:text-[var(--primary-glow)] flex items-center gap-0.5 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded-md"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            No transactions yet. Click &quot;+ Add Transaction&quot; to begin!
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto pr-1">
            {transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--surface-hover)] px-2 rounded-inner transition-colors"
                >
                  {/* Category Icon & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-inner flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${tx.category.color}25`,
                        color: tx.category.color,
                      }}
                    >
                      <CategoryIcon name={tx.category.icon} className="w-5 h-5" />
                    </div>

                    <div className="truncate">
                      <p className="text-xs font-semibold text-[var(--text-heading)] truncate">
                        {tx.note || tx.category.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                        <span className="font-medium text-[var(--text-secondary)]">
                          {tx.category.name}
                        </span>
                        <span>•</span>
                        <span>{formatRelativeDate(tx.date)}</span>
                        {tx.recurring && (
                          <>
                            <span>•</span>
                            <span className="text-[var(--primary)]">Recurring</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="shrink-0 text-right">
                    <span
                      className={`font-mono font-bold text-sm tabular-nums whitespace-nowrap ${
                        isIncome ? "text-[var(--income-text)]" : "text-[var(--expense-text)]"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount, currency)}
                    </span>
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

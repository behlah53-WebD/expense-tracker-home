"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";

interface CategoryDataPoint {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

interface CategoryDonutProps {
  categories?: CategoryDataPoint[];
  totalAmount?: number;
  title?: string;
  currency?: string;
}

export function CategoryDonut({
  categories = [],
  totalAmount = 0,
  title = "Spending by Category",
  currency = "INR",
}: CategoryDonutProps) {
  const displayCategories = categories.length > 0 ? categories : [];

  return (
    <GlassCard className="h-full flex flex-col justify-between">
      <div>
        <h2 className="text-[15px] font-semibold font-heading text-[var(--text-heading)]">
          {title}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Distribution for current month
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-4">
        {/* Donut Chart with Center Total */}
        <div className="h-56 relative flex items-center justify-center">
          {displayCategories.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)]">No category data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as CategoryDataPoint;
                        return (
                          <div className="glass-card p-2.5 bg-[var(--bg-elevated)]/95 border border-[var(--border)] text-xs space-y-1 shadow-xl">
                            <span className="font-semibold text-[var(--text-heading)] flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                                aria-hidden="true"
                              />
                              {data.name}
                            </span>
                            <p className="font-mono text-sm font-bold text-[var(--text-heading)]">
                              {formatCurrency(data.amount, currency)}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              {data.percentage}% of total
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={displayCategories}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={4}
                    stroke="transparent"
                  >
                    {displayCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{
                          filter: `drop-shadow(0px 0px 4px ${entry.color}88)`,
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Total Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  Total
                </span>
                <span className="text-sm font-mono font-bold text-[var(--text-heading)]">
                  {formatCurrency(totalAmount, currency, true)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Legend List */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {displayCategories.slice(0, 5).map((cat) => (
            <div
              key={cat.categoryId}
              className="flex items-center justify-between text-xs p-2 rounded-inner bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-[var(--text-secondary)] truncate">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-semibold text-[var(--text-heading)]">
                  {formatCurrency(cat.amount, currency, true)}
                </span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                  }}
                >
                  {cat.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/glass-card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { CountUpAmount } from "@/components/ui/count-up-amount";
import {
  useSummary,
  useMonthlyTrend,
  useCategoryBreakdown,
} from "@/hooks/useReports";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Download,
  Sparkles,
  TrendingUp,
  DollarSign,
  PieChart,
  Award,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

// Lazy-load CategoryDonut
const CategoryDonut = dynamic(
  () =>
    import("@/components/charts/category-donut").then(mod => mod.CategoryDonut),
  {
    ssr: false,
    loading: () => (
      <GlassCard className="h-full flex flex-col justify-center items-center py-12">
        <div className="w-40 h-40 rounded-full border-4 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Loading spending distribution...
        </p>
      </GlassCard>
    ),
  }
);

// Lazy-load InflowOutflowBarChart
const InflowOutflowBarChart = dynamic(
  () =>
    import("@/components/charts/inflow-outflow-bar-chart").then(
      mod => mod.InflowOutflowBarChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading comparative cash flow...
      </div>
    ),
  }
);

// Lazy-load NetSavingsLineChart
const NetSavingsLineChart = dynamic(
  () =>
    import("@/components/charts/net-savings-line-chart").then(
      mod => mod.NetSavingsLineChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading net surplus trend...
      </div>
    ),
  }
);

export default function ReportsPage() {
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency || "INR";

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: summary } = useSummary();
  const { data: monthlyData } = useMonthlyTrend();
  const { data: categoryData } = useCategoryBreakdown({ type: "EXPENSE" });

  const monthlyPoints = monthlyData?.["12M"] || [];
  const categories = categoryData?.categories || [];
  const top5Expenses = categoryData?.top5Transactions || [];

  // Summary Tiles Calculations
  const netSavings = summary?.currentMonth?.netSavings || 0;
  const savingsRate = summary?.currentMonth?.savingsRate || 0;
  const currentExpense = summary?.currentMonth?.expense || 0;
  const avgDailySpend = Math.round(currentExpense / 30);
  const biggestCategory = categoryData?.biggestCategory || "Food";

  // Calculate best month from 12-month data
  const bestMonth = useMemo(() => {
    let best = "N/A";
    let max = -Infinity;
    for (const m of monthlyPoints) {
      if (m.net > max) {
        max = m.net;
        best = m.label;
      }
    }
    return best;
  }, [monthlyPoints]);

  const handleExportCSV = () => {
    toast.info("Preparing transaction export...");
    window.location.href = "/api/reports/export?format=csv";
  };

  return (
    <div className="space-y-6">
      {/* Header with Export CSV */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
            <span>Financial Reports & Intelligence</span>
            <Sparkles className="w-5 h-5 text-[var(--aurora-cyan)]" />
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Deep dive into spending distributions, monthly comparisons, and
            automated insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="btn-primary-glow h-11 px-4 text-xs font-semibold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Savings Tile */}
        <GlassCard
          spotlightColor="rgba(46, 242, 176, 0.15)"
          className="h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[var(--text-muted)]">
              Net Savings
            </span>
            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-[var(--aurora-mint)]/15 text-[var(--aurora-mint)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--text-primary)]">
            <CountUpAmount amount={netSavings} currency={currency} />
          </div>
          <p className="text-xs text-income mt-2 font-semibold">
            {savingsRate}% savings rate
          </p>
        </GlassCard>

        {/* Avg Daily Spend Tile */}
        <GlassCard
          spotlightColor="rgba(255, 92, 138, 0.15)"
          className="h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[var(--text-muted)]">
              Avg Daily Spend
            </span>
            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-[var(--aurora-coral)]/15 text-[var(--aurora-coral)] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-[var(--text-primary)]">
            <CountUpAmount amount={avgDailySpend} currency={currency} />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Prorated across 30 days
          </p>
        </GlassCard>

        {/* Biggest Category Tile */}
        <GlassCard
          spotlightColor="rgba(124, 92, 255, 0.15)"
          className="h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[var(--text-muted)]">
              Biggest Category
            </span>
            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-heading text-[var(--text-primary)] truncate">
            {biggestCategory}
          </div>
          <p className="text-xs text-[var(--aurora-cyan)] mt-2">
            Dominant monthly expenditure
          </p>
        </GlassCard>

        {/* Best Month Tile */}
        <GlassCard
          spotlightColor="rgba(255, 200, 87, 0.15)"
          className="h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[var(--text-muted)]">
              Best Month
            </span>
            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-[var(--aurora-gold)]/15 text-[var(--aurora-gold)] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-heading text-[var(--text-primary)]">
            {bestMonth}
          </div>
          <p className="text-xs text-gold mt-2">Peak historical surplus</p>
        </GlassCard>
      </div>

      {/* Smart Insight Glass Card */}
      <GlassCard
        spotlightColor="rgba(124, 92, 255, 0.2)"
        className="border border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--surface)] to-[var(--aurora-cyan)]/10"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--aurora-cyan)] flex items-center justify-center text-white shrink-0 shadow-glow-violet">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="font-heading font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <span>Expense Tracker Smart Insights</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-income/20 text-income">
                Rule-Powered
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {categoryData?.insights?.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-[var(--text-secondary)] p-2.5 rounded-[var(--radius-inner)] bg-[var(--surface)] border border-[var(--border)]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--aurora-cyan)] shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Charts Grid: Monthly Grouped Bar Chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly Income vs Expense (Grouped Bars) */}
        <GlassCard className="lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Monthly Inflow vs Outflow
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Side-by-side comparison across the last 12 months
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-income">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--aurora-mint)]" />{" "}
                Income
              </span>
              <span className="flex items-center gap-1.5 text-expense">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--aurora-coral)]" />{" "}
                Expense
              </span>
            </div>
          </div>

          <div className="h-72 w-full min-h-[280px]">
            <InflowOutflowBarChart data={monthlyPoints} currency={currency} />
          </div>
        </GlassCard>

        {/* Category Breakdown Donut */}
        <div className="lg:col-span-2">
          <CategoryDonut
            categories={categories}
            totalAmount={categoryData?.totalAmount || 0}
            title="Spending Distribution"
            currency={currency}
          />
        </div>
      </div>

      {/* Yearly Net Trend Line Chart + Top 5 Expenses Ranked */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Net Savings Trend Line */}
        <GlassCard className="lg:col-span-3 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
              Yearly Net Savings Trajectory
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Net balance surplus (Income - Expenses) over time
            </p>
          </div>

          <div className="h-64 w-full pt-4 min-h-[250px]">
            <NetSavingsLineChart data={monthlyPoints} currency={currency} />
          </div>
        </GlassCard>

        {/* Top 5 Expenses Ranked List */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between">
          <div className="mb-3">
            <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
              Top 5 Expenses
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Ranked highest single transactions
            </p>
          </div>

          <div className="divide-y divide-[var(--border)]/40 max-h-64 overflow-y-auto pr-1">
            {top5Expenses.map((tx, idx) => (
              <div
                key={tx.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-[var(--surface-hover)] px-2 rounded-[var(--radius-inner)] transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-5 h-5 rounded-full bg-[var(--primary)]/20 text-[var(--aurora-cyan)] flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                    #{idx + 1}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${tx.category.color}25`,
                      color: tx.category.color,
                    }}
                  >
                    <CategoryIcon
                      name={tx.category.icon}
                      className="w-3.5 h-3.5"
                    />
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {tx.note || tx.category.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                      {formatDate(tx.date)}
                    </p>
                  </div>
                </div>

                <span className="font-mono font-bold text-expense shrink-0 tabular-nums">
                  -{formatCurrency(tx.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

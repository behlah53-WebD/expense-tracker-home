"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/glass-card";
import { CountUpAmount } from "@/components/ui/count-up-amount";
import { CategoryIcon } from "@/components/ui/category-icon";
import { TransactionDrawer } from "@/components/forms/transaction-drawer";
import {
  useTransactions,
  useDeleteTransaction,
  TransactionWithCategory,
} from "@/hooks/useTransactions";
import { useCategoryBreakdown, useMonthlyTrend } from "@/hooks/useReports";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Briefcase,
  Laptop,
  TrendingUp,
  Coins,
  ArrowUpRight,
  Edit2,
  Trash2,
  Repeat,
  Sparkles,
} from "lucide-react";

// Lazy-load CategoryDonut
const CategoryDonut = dynamic(
  () =>
    import("@/components/charts/category-donut").then(mod => mod.CategoryDonut),
  {
    ssr: false,
    loading: () => (
      <GlassCard className="h-full flex flex-col justify-center items-center py-12">
        <div className="w-40 h-40 rounded-full border-4 border-[var(--border)] border-t-[var(--aurora-mint)] animate-spin" />
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Loading inflow breakdown...
        </p>
      </GlassCard>
    ),
  }
);

// Lazy-load IncomeTrajectoryChart
const IncomeTrajectoryChart = dynamic(
  () =>
    import("@/components/charts/income-trajectory-chart").then(
      mod => mod.IncomeTrajectoryChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading trajectory chart...
      </div>
    ),
  }
);

export default function IncomePage() {
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency || "INR";

  const [isMounted, setIsMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionWithCategory | null>(
    null
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Income transactions
  const { data: txData, isLoading } = useTransactions({
    type: "INCOME",
    limit: 20,
    sort: "date-desc",
  });

  // Income breakdown
  const { data: categoryData } = useCategoryBreakdown({ type: "INCOME" });
  const { data: monthlyData } = useMonthlyTrend();

  const transactions = txData?.transactions || [];
  const categories = categoryData?.categories || [];
  const totalIncome = categoryData?.totalAmount || 0;

  // Extract source categories
  const salaryCat = categories.find(c => c.name.toLowerCase() === "salary");
  const freelanceCat = categories.find(
    c => c.name.toLowerCase() === "freelance"
  );
  const investmentCat = categories.find(
    c => c.name.toLowerCase() === "investments"
  );

  const monthlyBarPoints = useMemo(() => {
    return (monthlyData?.["12M"] || []).map(m => ({
      label: m.label,
      income: m.income,
    }));
  }, [monthlyData]);

  const deleteMutation = useDeleteTransaction();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
            <span>Income Management</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--aurora-mint)] shadow-glow-mint" />
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Analyze inflow channels, recurring salary, and investment dividends
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTx(null);
            setIsDrawerOpen(true);
          }}
          className="h-11 px-4 rounded-[var(--radius-button)] font-semibold text-xs text-black bg-gradient-to-r from-[var(--aurora-mint)] to-[#10B981] shadow-glow-mint hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record Income</span>
        </button>
      </div>

      {/* Source Breakdown Cards (Equal heights) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Salary Card */}
        <GlassCard
          spotlightColor="rgba(46, 242, 176, 0.15)"
          className="border-t-2 border-t-[var(--aurora-mint)] h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[var(--text-muted)]">
              Salary Retainer
            </span>
            <div className="w-9 h-9 rounded-[var(--radius-inner)] bg-[var(--aurora-mint)]/15 text-[var(--aurora-mint)] flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold font-mono text-[var(--text-primary)]">
            <CountUpAmount
              amount={salaryCat?.amount || 0}
              currency={currency}
            />
          </div>
          <p className="text-xs text-income mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {salaryCat?.percentage || 0}% of monthly inflow
          </p>
        </GlassCard>

        {/* Freelance Card */}
        <GlassCard
          spotlightColor="rgba(56, 213, 255, 0.15)"
          className="border-t-2 border-t-[var(--aurora-cyan)] h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[var(--text-muted)]">
              Freelance & Advisory
            </span>
            <div className="w-9 h-9 rounded-[var(--radius-inner)] bg-[var(--aurora-cyan)]/15 text-[var(--aurora-cyan)] flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold font-mono text-[var(--text-primary)]">
            <CountUpAmount
              amount={freelanceCat?.amount || 0}
              currency={currency}
            />
          </div>
          <p className="text-xs text-[var(--aurora-cyan)] mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {freelanceCat?.percentage || 0}% of monthly inflow
          </p>
        </GlassCard>

        {/* Investments Card */}
        <GlassCard
          spotlightColor="rgba(255, 200, 87, 0.15)"
          className="border-t-2 border-t-[var(--aurora-gold)] h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-[var(--text-muted)]">
              Dividends & Returns
            </span>
            <div className="w-9 h-9 rounded-[var(--radius-inner)] bg-[var(--aurora-gold)]/15 text-[var(--aurora-gold)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold font-mono text-[var(--text-primary)]">
            <CountUpAmount
              amount={investmentCat?.amount || 0}
              currency={currency}
            />
          </div>
          <p className="text-xs text-gold mt-2 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            {investmentCat?.percentage || 0}% of monthly inflow
          </p>
        </GlassCard>
      </div>

      {/* Visual Charts Grid: Donut + Monthly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Income Donut (2 cols) */}
        <div className="lg:col-span-2">
          <CategoryDonut
            categories={categories}
            totalAmount={totalIncome}
            title="Inflow by Category"
            currency={currency}
          />
        </div>

        {/* Monthly Income Bar Chart (3 cols) */}
        <GlassCard className="lg:col-span-3 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
              Monthly Inflow Trajectory
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Consistent inflow velocity over the last 12 months
            </p>
          </div>

          <div className="h-64 w-full pt-4 min-h-[250px]">
            <IncomeTrajectoryChart
              data={monthlyBarPoints}
              currency={currency}
            />
          </div>
        </GlassCard>
      </div>

      {/* Income Records: Mobile Stacked Cards + Desktop Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
              Income Ledger
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Verified income receipts
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-[var(--text-muted)]">
            Loading income records...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--text-muted)]">
            No income entries found.
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards (< 768px): Stacked rows without horizontal scroll */}
            <div className="block md:hidden divide-y divide-[var(--border)]/40">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${tx.category.color}25`,
                        color: tx.category.color,
                      }}
                    >
                      <CategoryIcon
                        name={tx.category.icon}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                          {tx.category.name}
                        </span>
                        {tx.recurring && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-income bg-income/15 px-1.5 py-0.2 rounded-full font-medium">
                            <Repeat className="w-2.5 h-2.5" /> Recurring
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {tx.note || "Salary payment"}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-mono font-bold text-sm text-income tabular-nums whitespace-nowrap">
                      +{formatCurrency(tx.amount, currency)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTx(tx);
                          setIsDrawerOpen(true);
                        }}
                        className="w-11 h-11 rounded-xl flex items-center justify-center glass-card text-[var(--text-muted)] hover:text-[var(--aurora-cyan)] transition-colors"
                        aria-label={`Edit ${tx.category.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(tx.id)}
                        className="w-11 h-11 rounded-xl flex items-center justify-center glass-card text-[var(--text-muted)] hover:text-[var(--aurora-coral)] transition-colors"
                        aria-label={`Delete ${tx.category.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Source</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-right">Inflow Amount</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/40">
                  {transactions.map(tx => (
                    <tr
                      key={tx.id}
                      className="hover:bg-[var(--surface-hover)] transition-colors group"
                    >
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${tx.category.color}25`,
                              color: tx.category.color,
                            }}
                          >
                            <CategoryIcon
                              name={tx.category.icon}
                              className="w-4 h-4"
                            />
                          </div>
                          <span className="font-semibold text-[var(--text-primary)]">
                            {tx.category.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                          <span>{tx.note || "Salary payment"}</span>
                          {tx.recurring && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-income bg-income/15 px-1.5 py-0.5 rounded-full">
                              <Repeat className="w-2.5 h-2.5" /> Recurring
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap text-[var(--text-muted)] font-mono">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap text-right font-mono font-bold text-sm text-income tabular-nums">
                        +{formatCurrency(tx.amount, currency)}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingTx(tx);
                              setIsDrawerOpen(true);
                            }}
                            className="w-11 h-11 rounded-xl flex items-center justify-center glass-card hover:text-[var(--aurora-cyan)] transition-colors"
                            aria-label={`Edit ${tx.category.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(tx.id)}
                            className="w-11 h-11 rounded-xl flex items-center justify-center glass-card hover:text-[var(--aurora-coral)] transition-colors"
                            aria-label={`Delete ${tx.category.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </GlassCard>

      {/* Transaction Slide-over Drawer */}
      <TransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingTx(null);
        }}
        transactionToEdit={editingTx}
        defaultType="INCOME"
      />
    </div>
  );
}

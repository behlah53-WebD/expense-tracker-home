"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/glass-card";
import { BalanceOrb } from "@/components/dashboard/balance-orb";
import { StatCard } from "@/components/dashboard/stat-card";
import { SavingsRing } from "@/components/dashboard/savings-ring";
import { BudgetProgressCard } from "@/components/dashboard/budget-progress-card";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";
import { CountUpAmount } from "@/components/ui/count-up-amount";
import {
  useSummary,
  useMonthlyTrend,
  useCategoryBreakdown,
} from "@/hooks/useReports";
import {
  TrendingUp,
  ArrowDownRight,
  Wallet,
  Plus,
  ArrowLeftRight,
  Target,
  BarChart3,
  Lightbulb,
  Flame,
  PiggyBank,
  CalendarClock,
} from "lucide-react";

/* ───────────── lazy charts (client-only, skeleton while loading) ───────────── */

const ChartSkeleton = ({ label, h }: { label: string; h: string }) => (
  <GlassCard className={`h-full ${h} flex items-center justify-center`}>
    <div className="animate-pulse flex flex-col items-center gap-3 text-xs text-[var(--text-muted)]">
      <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)]" />
      <span>{label}</span>
    </div>
  </GlassCard>
);

const GlowingCashFlow = dynamic(
  () =>
    import("@/components/charts/glowing-cash-flow").then(
      m => m.GlowingCashFlow
    ),
  {
    ssr: false,
    loading: () => (
      <ChartSkeleton label="Loading cash flow…" h="min-h-[380px]" />
    ),
  }
);
const CategoryDonut = dynamic(
  () => import("@/components/charts/category-donut").then(m => m.CategoryDonut),
  {
    ssr: false,
    loading: () => (
      <ChartSkeleton label="Loading categories…" h="min-h-[320px]" />
    ),
  }
);

/* ───────────── helpers ───────────── */

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const makeFmt = (currency: string) => {
  const f = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return (n: number) => f.format(Math.round(n));
};

/** Pull a numeric series out of the monthly trend; falls back to a flat line ending at `last`. */
const toSeries = (rows: any, key: string, last: number): number[] => {
  const s = Array.isArray(rows)
    ? rows
        .map(r => Number(r?.[key]))
        .filter(v => Number.isFinite(v))
        .slice(-7)
    : [];
  return s.length >= 2 ? s : [last, last];
};

/* ───────────── small presentational pieces ───────────── */

const DeltaChip = memo(function DeltaChip({
  value,
  goodWhenUp = true,
}: {
  value: number;
  goodWhenUp?: boolean;
}) {
  const up = value >= 0;
  const good = up === goodWhenUp;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border"
      style={{
        color: good ? "var(--income-text)" : "var(--expense-text)",
        borderColor: good
          ? "color-mix(in srgb, var(--income-text) 35%, transparent)"
          : "color-mix(in srgb, var(--expense-text) 35%, transparent)",
        background: good
          ? "color-mix(in srgb, var(--income-text) 10%, transparent)"
          : "color-mix(in srgb, var(--expense-text) 10%, transparent)",
      }}
    >
      {up ? "▲" : "▼"} {Math.abs(value)}% vs last month
    </span>
  );
});

const QuickActions = memo(function QuickActions() {
  const actions = [
    {
      href: "/transactions?new=1",
      label: "Add transaction",
      Icon: Plus,
      primary: true,
    },
    { href: "/transactions", label: "All activity", Icon: ArrowLeftRight },
    { href: "/budgets", label: "Budgets", Icon: Target },
    { href: "/reports", label: "Reports", Icon: BarChart3 },
  ];
  return (
    <nav
      aria-label="Quick actions"
      className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
    >
      {actions.map(({ href, label, Icon, primary }) => (
        <Link
          key={label}
          href={href}
          prefetch
          className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-[transform,background,box-shadow] duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
            primary
              ? "text-white shadow-[0_8px_24px_-8px_var(--primary)] bg-[linear-gradient(135deg,var(--primary),var(--accent-cyan))] hover:brightness-110"
              : "border border-[var(--border)] bg-[var(--surface-hover)]/60 text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
});

/** The page's signature element: how far through the month you are vs. how much of your income is gone. */
const MonthPace = memo(function MonthPace(props: {
  income: number;
  expense: number;
  day: number;
  daysInMonth: number;
  fmt: (n: number) => string;
}) {
  const { income, expense, day, daysInMonth, fmt } = props;
  const base = Math.max(income, expense, 1);
  const spentPct = (expense / base) * 100;
  const projected = day > 0 ? (expense / day) * daysInMonth : expense;
  const projectedPct = clamp((projected / base) * 100, 0, 100);
  const todayPct = (day / daysInMonth) * 100;
  const over = projected > income && income > 0;
  const gap = Math.abs(income - projected);

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-heading)]">
            Month pace
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Day {day} of {daysInMonth}
          </p>
        </div>
        <p className="text-right text-xs text-[var(--text-secondary)] max-w-[60%]">
          {income > 0 ? (
            <>
              At this rate you&apos;ll spend{" "}
              <strong className="font-mono text-[var(--text-heading)]">
                {fmt(projected)}
              </strong>
              ,{" "}
              <span
                style={{
                  color: over ? "var(--expense-text)" : "var(--income-text)",
                }}
              >
                {fmt(gap)} {over ? "over" : "under"} your income
              </span>
              .
            </>
          ) : (
            "Add income to see your projected month-end."
          )}
        </p>
      </div>

      <div
        className="relative h-3.5 rounded-full bg-[var(--surface-hover)] overflow-hidden"
        role="img"
        aria-label={`Spent ${Math.round(spentPct)}% of income so far, ${Math.round(todayPct)}% of the month elapsed`}
      >
        {/* projected (hatched) */}
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-60"
          style={{
            width: `${projectedPct}%`,
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--expense-text) 0 4px, transparent 4px 8px)",
          }}
        />
        {/* actual */}
        <div
          className="dx-grow absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${clamp(spentPct, 0, 100)}%`,
            background:
              "linear-gradient(90deg, var(--primary), var(--accent-cyan))",
            boxShadow: "0 0 18px var(--primary)",
          }}
        />
        {/* today marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/90"
          style={{ left: `${todayPct}%` }}
        />
      </div>
      <div className="relative h-4 mt-1.5 text-[10px] text-[var(--text-muted)]">
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `clamp(14px, ${todayPct}%, calc(100% - 14px))` }}
        >
          Today
        </span>
      </div>
    </div>
  );
});

const HealthScore = memo(function HealthScore({ score }: { score: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const tone =
    score >= 75
      ? "var(--income-text)"
      : score >= 50
        ? "var(--accent-cyan)"
        : "var(--expense-text)";
  const label =
    score >= 75 ? "Excellent" : score >= 50 ? "Steady" : "Needs attention";
  return (
    <div className="flex items-center gap-4">
      <svg
        width="104"
        height="104"
        viewBox="0 0 104 104"
        role="img"
        aria-label={`Financial health ${score} out of 100`}
      >
        <circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          stroke="var(--surface-hover)"
          strokeWidth="9"
        />
        <circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
          transform="rotate(-90 52 52)"
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)",
            filter: `drop-shadow(0 0 6px ${tone})`,
          }}
        />
        <text
          x="52"
          y="58"
          textAnchor="middle"
          className="font-heading"
          fontSize="26"
          fontWeight="700"
          fill="var(--text-heading)"
        >
          {score}
        </text>
      </svg>
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-heading)]">
          Financial health
        </p>
        <p className="text-sm font-medium" style={{ color: tone }}>
          {label}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)] max-w-[160px]">
          Based on savings rate, spending trend and net position.
        </p>
      </div>
    </div>
  );
});

type Insight = {
  Icon: React.ElementType;
  lead: string;
  strong?: string;
  tail?: string;
  tone?: "good" | "bad";
};

const Insights = memo(function Insights({ items }: { items: Insight[] }) {
  return (
    <ul className="space-y-3">
      {items.map((it, i) => {
        const Icon = it.Icon;
        const color =
          it.tone === "good"
            ? "var(--income-text)"
            : it.tone === "bad"
              ? "var(--expense-text)"
              : "var(--text-heading)";
        return (
          <li
            key={i}
            className="flex gap-3 text-[13px] leading-snug text-[var(--text-secondary)]"
          >
            <span className="mt-0.5 grid place-items-center w-7 h-7 shrink-0 rounded-lg bg-[var(--primary)]/15 text-[var(--primary-glow)]">
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span>
              {it.lead}
              {it.strong ? <b style={{ color }}>{it.strong}</b> : null}
              {it.tail}
            </span>
          </li>
        );
      })}
    </ul>
  );
});

/* ───────────── page ───────────── */

export default function DashboardPage() {
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency || "INR";
  const firstName = ((session?.user?.name as string) || "").split(" ")[0];

  const { data: summary } = useSummary();
  const { data: monthlyData } = useMonthlyTrend();
  const { data: categoryData } = useCategoryBreakdown({ type: "EXPENSE" });

  // client-only clock avoids SSR/hydration mismatch
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const m = useMemo(() => {
    const cm = summary?.currentMonth;
    const income = cm?.income || 0;
    const expense = cm?.expense || 0;
    return {
      totalBalance: summary?.totalBalance || 0,
      income,
      expense,
      netSavings: cm?.netSavings || 0,
      savingsRate: cm?.savingsRate || 0,
      incomeDelta: summary?.deltas?.income || 0,
      expenseDelta: summary?.deltas?.expense || 0,
      savingsDelta: summary?.deltas?.savings || 0,
    };
  }, [summary]);

  const fmt = useMemo(() => makeFmt(currency), [currency]);

  const day = now?.getDate() ?? 1;
  const daysInMonth = now
    ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    : 30;
  const greeting = !now
    ? "Welcome back"
    : now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const dateLabel =
    now?.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }) ?? "";

  const score = useMemo(
    () =>
      clamp(
        Math.round(
          clamp(m.savingsRate, 0, 40) * 1.5 +
            (m.netSavings > 0 ? 20 : 0) +
            (m.expenseDelta <= 0 ? 20 : m.expenseDelta < 10 ? 10 : 0)
        ),
        0,
        100
      ),
    [m]
  );

  const topCategory = categoryData?.categories?.[0];
  const dailyBurn = m.expense / Math.max(day, 1);
  const runwayDays =
    dailyBurn > 0 ? Math.floor(m.totalBalance / dailyBurn) : null;

  const insights = useMemo(() => {
    const out: Insight[] = [];
    const rate = Math.round(m.savingsRate);
    out.push(
      m.savingsRate >= 20
        ? {
            Icon: PiggyBank,
            lead: "You are saving ",
            strong: rate + "%",
            tail: " of your income. A healthy pace.",
            tone: "good",
          }
        : {
            Icon: PiggyBank,
            lead: "You are saving ",
            strong: rate + "%",
            tail: ". Aim for 20% to build a buffer.",
          }
    );
    if (m.expenseDelta > 0) {
      out.push({
        Icon: Flame,
        lead: "Spending is up ",
        strong: m.expenseDelta + "%",
        tail: " compared with last month.",
        tone: "bad",
      });
    } else if (m.expenseDelta < 0) {
      out.push({
        Icon: Flame,
        lead: "Spending is down ",
        strong: Math.abs(m.expenseDelta) + "%",
        tail: " compared with last month.",
        tone: "good",
      });
    }
    const topName = topCategory?.name;
    if (topName) {
      out.push({
        Icon: Lightbulb,
        lead: "",
        strong: String(topName),
        tail: " is your biggest expense this period.",
      });
    }
    if (runwayDays !== null) {
      out.push({
        Icon: CalendarClock,
        lead: "Your balance covers about ",
        strong: runwayDays + " days",
        tail: " at today's daily spend.",
      });
    }
    return out;
  }, [m, topCategory, runwayDays]);

  const incomeSeries = useMemo(
    () => toSeries(monthlyData, "income", m.income),
    [monthlyData, m.income]
  );
  const expenseSeries = useMemo(
    () => toSeries(monthlyData, "expense", m.expense),
    [monthlyData, m.expense]
  );

  const categories = categoryData?.categories || [];
  const transactions = summary?.recentTransactions || [];

  return (
    <div className="dx-root relative isolate space-y-6">
      <style>{`
        .dx-aurora{position:absolute;inset:-80px -40px auto -40px;height:520px;z-index:-1;pointer-events:none;overflow:hidden;
          -webkit-mask-image:linear-gradient(to bottom,#000 40%,transparent);mask-image:linear-gradient(to bottom,#000 40%,transparent)}
        .dx-aurora i{position:absolute;border-radius:9999px;filter:blur(90px);opacity:.45;animation:dx-drift 22s ease-in-out infinite alternate}
        .dx-aurora i:nth-child(1){width:420px;height:420px;left:6%;top:-40px;background:var(--primary)}
        .dx-aurora i:nth-child(2){width:360px;height:360px;right:8%;top:20px;background:var(--accent-cyan);opacity:.28;animation-duration:28s}
        .dx-aurora i:nth-child(3){width:300px;height:300px;left:42%;top:120px;background:#ff6b9d;opacity:.16;animation-duration:34s}
        @keyframes dx-drift{to{transform:translate3d(40px,30px,0) scale(1.12)}}
        .dx-grow{transform-origin:left;animation:dx-grow 1.1s cubic-bezier(.2,.8,.2,1) both}
        @keyframes dx-grow{from{transform:scaleX(0)}}
        @media (prefers-reduced-motion:reduce){.dx-aurora i,.dx-grow{animation:none}}
      `}</style>
      <div className="dx-aurora" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      {/* Header: greeting + quick actions */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs text-[var(--text-muted)] min-h-4">
            {dateLabel}
          </p>
          <h1 className="font-heading text-[clamp(26px,4vw,38px)] font-bold tracking-[-0.02em] text-[var(--text-heading)] leading-tight">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {m.netSavings >= 0
              ? "Here’s how your money is moving this month."
              : "Spending is ahead of income this month. Here’s the picture."}
          </p>
        </div>
        <QuickActions />
      </header>

      {/* Bento grid: one responsive layout (no triplicated trees) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
        {/* Hero: balance + orb + month pace */}
        <div className="sm:col-span-2 lg:col-span-8">
          <GlassCard
            spotlightColor="rgba(124, 92, 255, 0.22)"
            className="h-full overflow-hidden"
          >
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)]">
                  <Wallet
                    className="w-3.5 h-3.5 text-[var(--primary)]"
                    aria-hidden="true"
                  />{" "}
                  Total balance
                </span>
                <div className="mt-2 text-[clamp(38px,6vw,60px)] font-bold font-heading leading-[1.03] tracking-[-0.03em] text-[var(--text-heading)]">
                  <CountUpAmount amount={m.totalBalance} currency={currency} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <DeltaChip value={m.savingsDelta} />
                  <span className="text-xs text-[var(--text-muted)]">
                    Net this month{" "}
                    <strong
                      className="font-mono"
                      style={{
                        color:
                          m.netSavings >= 0
                            ? "var(--income-text)"
                            : "var(--expense-text)",
                      }}
                    >
                      {m.netSavings >= 0 ? "+" : "−"}
                      {fmt(Math.abs(m.netSavings))}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="flex justify-center">
                <BalanceOrb
                  savingsRate={m.savingsRate}
                  size="md"
                  showLabel={true}
                />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--border)] grid gap-5 md:grid-cols-[1fr_1.6fr]">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-[var(--text-muted)]">Money in</dt>
                  <dd className="mt-0.5 font-mono text-lg font-semibold text-[var(--income-text)]">
                    +{fmt(m.income)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--text-muted)]">
                    Money out
                  </dt>
                  <dd className="mt-0.5 font-mono text-lg font-semibold text-[var(--expense-text)]">
                    −{fmt(m.expense)}
                  </dd>
                </div>
              </dl>
              <MonthPace
                income={m.income}
                expense={m.expense}
                day={day}
                daysInMonth={daysInMonth}
                fmt={fmt}
              />
            </div>
          </GlassCard>
        </div>

        {/* Health + insights */}
        <div className="sm:col-span-2 lg:col-span-4">
          <GlassCard className="h-full space-y-5">
            <HealthScore score={score} />
            <div className="border-t border-[var(--border)] pt-4">
              <p className="mb-3 text-[13px] font-semibold text-[var(--text-heading)]">
                What stands out
              </p>
              <Insights items={insights} />
            </div>
          </GlassCard>
        </div>

        {/* KPI row */}
        <div className="lg:col-span-4">
          <StatCard
            title="Monthly Income"
            amount={m.income}
            delta={m.incomeDelta}
            deltaPeriod="vs last month"
            type="income"
            icon={
              <TrendingUp className="w-5 h-5 text-white" aria-hidden="true" />
            }
            currency={currency}
            sparklineData={incomeSeries}
          />
        </div>
        <div className="lg:col-span-4">
          <StatCard
            title="Monthly Expenses"
            amount={m.expense}
            delta={m.expenseDelta}
            deltaPeriod="vs last month"
            type="expense"
            icon={
              <ArrowDownRight
                className="w-5 h-5 text-white"
                aria-hidden="true"
              />
            }
            currency={currency}
            sparklineData={expenseSeries}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <SavingsRing
            savingsRate={m.savingsRate}
            netSavings={m.netSavings}
            currency={currency}
          />
        </div>

        {/* Charts */}
        <div className="sm:col-span-2 lg:col-span-8">
          <GlowingCashFlow data={monthlyData} currency={currency} />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <CategoryDonut
            categories={categories}
            totalAmount={categoryData?.totalAmount || 0}
            title="Spending by Category"
            currency={currency}
          />
        </div>

        {/* Activity + budgets */}
        <div className="sm:col-span-2 lg:col-span-7">
          <RecentTransactionsCard
            transactions={transactions}
            currency={currency}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-5">
          <BudgetProgressCard currency={currency} />
        </div>
      </div>
    </div>
  );
}

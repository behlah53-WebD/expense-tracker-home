"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/glass-card";
import { TransactionDrawer } from "@/components/forms/transaction-drawer";
import { CategoryIcon } from "@/components/ui/category-icon";
import {
  useTransactions,
  useDeleteTransaction,
  TransactionWithCategory,
} from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Repeat,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Receipt,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
} from "lucide-react";

type TxType = "INCOME" | "EXPENSE" | undefined;

/* ───────────── helpers ───────────── */

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

const dayLabel = (d: Date) => {
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) return "Today";
  if (dayKey(d) === dayKey(yest)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "long" });
};

type Group = {
  key: string;
  date: Date | null;
  items: TransactionWithCategory[];
  net: number;
};

/* ───────────── pieces ───────────── */

const SummaryTile = memo(function SummaryTile(props: {
  label: string;
  value: string;
  tone: "in" | "out" | "net";
  Icon: React.ElementType;
}) {
  const { label, value, tone, Icon } = props;
  const color =
    tone === "in"
      ? "var(--aurora-mint)"
      : tone === "out"
        ? "var(--aurora-coral)"
        : "var(--primary)";
  return (
    <div className="glass-card relative overflow-hidden px-4 py-3.5 flex items-center gap-3">
      <span
        className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
        style={{
          background: `color-mix(in srgb, ${color} 16%, transparent)`,
          color,
        }}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
        <p className="font-mono font-bold text-base sm:text-lg tabular-nums truncate text-[var(--text-primary)]">
          {value}
        </p>
      </div>
      <span
        className="absolute inset-x-0 bottom-0 h-0.5 opacity-70"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  );
});

const TxSlip = memo(function TxSlip(props: {
  tx: TransactionWithCategory;
  currency: string;
  maxAmount: number;
  showDate: boolean;
  onEdit: (tx: TransactionWithCategory) => void;
  onDelete: (id: string) => void;
}) {
  const { tx, currency, maxAmount, showDate, onEdit, onDelete } = props;
  const isIncome = tx.type === "INCOME";
  const color = tx.category.color || "var(--primary)";
  const weight = Math.max(
    4,
    Math.min(100, (Number(tx.amount) / (maxAmount || 1)) * 100)
  );

  return (
    <li className="group relative">
      {/* spine dot */}
      <span
        className="hidden md:block absolute -left-[27px] top-6 w-3 h-3 rounded-full border-2 border-[var(--bg-elevated)]"
        style={{
          background: color,
          boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 25%, transparent)`,
        }}
        aria-hidden="true"
      />
      <div className="glass-card relative overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-200 md:hover:-translate-y-0.5 md:hover:shadow-[0_12px_30px_-14px_rgba(0,0,0,.6)] focus-within:ring-1 focus-within:ring-[var(--primary)]">
        {/* category colour edge */}
        <span
          className="absolute left-0 inset-y-0 w-1"
          style={{ background: color }}
          aria-hidden="true"
        />

        <div className="flex items-center gap-3 sm:gap-4 pl-4 pr-3 sm:pr-4 py-3.5">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
              color,
            }}
          >
            <CategoryIcon name={tx.category.icon} className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[13px] text-[var(--text-primary)] truncate">
                {tx.category.name}
              </span>
              {tx.recurring && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--primary)] bg-[var(--primary)]/15 px-1.5 py-0.5 rounded-full">
                  <Repeat className="w-2.5 h-2.5" aria-hidden="true" /> Repeats
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
              {tx.note || "No note added"}
              {showDate && (
                <span className="font-mono"> · {formatDate(tx.date)}</span>
              )}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`font-mono font-bold text-[15px] sm:text-base tabular-nums whitespace-nowrap ${isIncome ? "text-income" : "text-expense"}`}
            >
              {isIncome ? "+" : "−"}
              {formatCurrency(tx.amount, currency)}
            </span>
            <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(tx)}
                className="p-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--aurora-cyan)] hover:bg-white/10 transition-colors"
                aria-label={`Edit ${tx.category.name} transaction`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(tx.id)}
                className="p-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--aurora-coral)] hover:bg-white/10 transition-colors"
                aria-label={`Delete ${tx.category.name} transaction`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* relative-size bar: how big this entry is compared with the largest on the page */}
        <div className="h-[3px] bg-white/5" aria-hidden="true">
          <div
            className="h-full rounded-r-full"
            style={{
              width: `${weight}%`,
              background: `linear-gradient(90deg, ${color}, transparent)`,
            }}
          />
        </div>
      </div>
    </li>
  );
});

const DayStub = memo(function DayStub({
  group,
  currency,
}: {
  group: Group;
  currency: string;
}) {
  if (!group.date) {
    return (
      <div className="md:sticky md:top-4 self-start">
        <p className="font-heading font-bold text-lg text-[var(--text-primary)]">
          Ranked by amount
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Dates are shown on each entry
        </p>
      </div>
    );
  }
  const d = group.date;
  return (
    <div className="md:sticky md:top-4 self-start flex md:block items-baseline md:items-start gap-3">
      <p className="font-heading font-bold leading-none text-[40px] md:text-[56px] tracking-[-0.04em] text-[var(--text-primary)]">
        {String(d.getDate()).padStart(2, "0")}
      </p>
      <div className="md:mt-1">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
          {dayLabel(d)}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        </p>
        <p
          className="mt-1 font-mono text-xs font-semibold tabular-nums"
          style={{
            color:
              group.net >= 0
                ? "var(--aurora-mint)"
                : "var(--aurora-coral)",
          }}
          title="Net for the day"
        >
          {group.net >= 0 ? "+" : "−"}
          {formatCurrency(Math.abs(group.net), currency)}
        </p>
      </div>
    </div>
  );
});

const SlipSkeleton = () => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading transactions">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="glass-card h-[74px] rounded-2xl dx-shimmer" />
    ))}
  </div>
);

/* ───────────── page ───────────── */

export default function TransactionsPage() {
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency || "INR";

  const [type, setType] = useState<TxType>(undefined);
  const [categoryId, setCategoryId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionWithCategory | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data, isLoading } = useTransactions({
    type,
    categoryId: categoryId === "ALL" ? undefined : categoryId,
    q: debouncedSearch || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
    sort,
    page,
    limit: 10,
  });
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteTransaction();

  const transactions = useMemo(() => data?.transactions || [], [data]);
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasMore: false,
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeleteConfirmId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleEdit = useCallback((tx: TransactionWithCategory) => {
    setEditingTx(tx);
    setIsDrawerOpen(true);
  }, []);
  const askDelete = useCallback((id: string) => setDeleteConfirmId(id), []);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteMutation.mutateAsync(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const resetFilters = () => {
    setType(undefined);
    setCategoryId("ALL");
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    setSort("date-desc");
    setPage(1);
  };

  // any filter change returns to page 1
  const withReset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const advancedCount =
    (categoryId !== "ALL" ? 1 : 0) +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0) +
    (sort !== "date-desc" ? 1 : 0);
  const activeCount = advancedCount + (type ? 1 : 0) + (searchQuery ? 1 : 0);

  /* totals for entries shown on this page */
  const totals = useMemo(() => {
    let inc = 0;
    let out = 0;
    let max = 0;
    for (const t of transactions) {
      const a = Number(t.amount) || 0;
      max = Math.max(max, a);
      if (t.type === "INCOME") inc += a;
      else out += a;
    }
    return { inc, out, net: inc - out, max };
  }, [transactions]);

  /* group by day when sorted by date; otherwise a single ranked group */
  const groups = useMemo<Group[]>(() => {
    if (!sort.startsWith("date")) {
      return transactions.length
        ? [{ key: "ranked", date: null, items: transactions, net: 0 }]
        : [];
    }
    const map = new Map<string, Group>();
    for (const t of transactions) {
      const d = new Date(t.date);
      const k = dayKey(d);
      let g = map.get(k);
      if (!g) {
        g = { key: k, date: d, items: [], net: 0 };
        map.set(k, g);
      }
      g.items.push(t);
      g.net += (t.type === "INCOME" ? 1 : -1) * (Number(t.amount) || 0);
    }
    return Array.from(map.values());
  }, [transactions, sort]);

  const typeOptions: { label: string; value: TxType }[] = [
    { label: "All", value: undefined },
    { label: "Expenses", value: "EXPENSE" },
    { label: "Income", value: "INCOME" },
  ];

  return (
    <div className="space-y-5">
      <style>{`
        .dx-shimmer{position:relative;overflow:hidden}
        .dx-shimmer::after{content:"";position:absolute;inset:0;transform:translateX(-100%);
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);animation:dx-sh 1.4s infinite}
        @keyframes dx-sh{to{transform:translateX(100%)}}
        @media (prefers-reduced-motion:reduce){.dx-shimmer::after{animation:none}}
      `}</style>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-[clamp(26px,4vw,36px)] tracking-[-0.02em] leading-tight text-[var(--text-primary)]">
            Transactions
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            <span className="font-mono font-semibold text-[var(--text-primary)]">
              {pagination.totalCount}
            </span>{" "}
            records
            {activeCount > 0 ? " match your filters" : " in your ledger"}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTx(null);
            setIsDrawerOpen(true);
          }}
          className="btn-primary-glow h-11 px-5 text-[13px] font-semibold flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          Add transaction
        </button>
      </header>

      {/* Page totals */}
      <section
        aria-label="Totals for entries on this page"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <SummaryTile
          label="Money in (this page)"
          value={formatCurrency(totals.inc, currency)}
          tone="in"
          Icon={ArrowDownLeft}
        />
        <SummaryTile
          label="Money out (this page)"
          value={formatCurrency(totals.out, currency)}
          tone="out"
          Icon={ArrowUpRight}
        />
        <SummaryTile
          label="Net (this page)"
          value={`${totals.net >= 0 ? "+" : "−"}${formatCurrency(Math.abs(totals.net), currency)}`}
          tone="net"
          Icon={Scale}
        />
      </section>

      {/* One toolbar for every screen size */}
      <GlassCard className="p-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by note or category"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="glass-input w-full h-11 pl-10 pr-3 text-base md:text-sm focus:outline-none"
              aria-label="Search transactions"
            />
          </div>

          <div
            role="group"
            aria-label="Transaction type"
            className="grid grid-cols-3 p-1 rounded-xl bg-white/5 border border-[var(--border)] md:w-[300px]"
          >
            {typeOptions.map(o => {
              const active = type === o.value;
              const bg =
                o.value === "EXPENSE"
                  ? "var(--aurora-coral)"
                  : o.value === "INCOME"
                    ? "var(--aurora-mint)"
                    : "var(--primary)";
              return (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setType(o.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-lg text-xs font-semibold transition-colors"
                  style={
                    active
                      ? {
                          background: bg,
                          color: o.value === "INCOME" ? "#05140d" : "#fff",
                        }
                      : { color: "var(--text-muted)" }
                  }
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            aria-expanded={showFilters}
            className={`h-11 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 border transition-colors ${
              advancedCount > 0 || showFilters
                ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/5"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            More filters
            {advancedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white font-mono text-[10px] grid place-items-center">
                {advancedCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[var(--border)]">
            <label className="space-y-1.5">
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                Category
              </span>
              <select
                value={categoryId}
                onChange={e => withReset(setCategoryId)(e.target.value)}
                className="glass-input w-full h-11 px-3 text-base md:text-sm bg-[var(--bg-elevated)]"
              >
                <option value="ALL">All categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                From
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={e => withReset(setFromDate)(e.target.value)}
                className="glass-input w-full h-11 px-3 text-base md:text-sm"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                To
              </span>
              <input
                type="date"
                value={toDate}
                onChange={e => withReset(setToDate)(e.target.value)}
                className="glass-input w-full h-11 px-3 text-base md:text-sm"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                Sort by
              </span>
              <select
                value={sort}
                onChange={e => withReset(setSort)(e.target.value)}
                className="glass-input w-full h-11 px-3 text-base md:text-sm bg-[var(--bg-elevated)]"
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="amount-desc">Highest amount</option>
                <option value="amount-asc">Lowest amount</option>
              </select>
            </label>
          </div>
        )}

        {activeCount > 0 && (
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--aurora-coral)] hover:underline"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" /> Clear all filters
            </button>
          </div>
        )}
      </GlassCard>

      {/* Ledger timeline */}
      <section aria-label="Transaction list">
        {isLoading ? (
          <SlipSkeleton />
        ) : transactions.length === 0 ? (
          <GlassCard className="py-16 flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/15 grid place-items-center text-[var(--primary)] mb-3">
              <Receipt className="w-7 h-7" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
              {activeCount > 0
                ? "Nothing matches these filters"
                : "No transactions yet"}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">
              {activeCount > 0
                ? "Try a different search or widen the date range."
                : "Add your first income or expense to start your ledger."}
            </p>
            <button
              onClick={
                activeCount > 0 ? resetFilters : () => setIsDrawerOpen(true)
              }
              className="mt-5 btn-primary-glow h-11 px-5 text-[13px] font-semibold"
            >
              {activeCount > 0 ? "Clear all filters" : "Add transaction"}
            </button>
          </GlassCard>
        ) : (
          <div className="space-y-8">
            {groups.map(g => (
              <div
                key={g.key}
                className="grid gap-3 md:grid-cols-[150px_1fr] md:gap-10"
              >
                <DayStub group={g} currency={currency} />
                <ul className="relative space-y-3 md:before:content-[''] md:before:absolute md:before:-left-[22px] md:before:top-3 md:before:bottom-3 md:before:border-l md:before:border-dashed md:before:border-[var(--border)]">
                  {g.items.map(tx => (
                    <TxSlip
                      key={tx.id}
                      tx={tx}
                      currency={currency}
                      maxAmount={totals.max}
                      showDate={!g.date}
                      onEdit={handleEdit}
                      onDelete={askDelete}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-8 flex items-center justify-between gap-3"
          >
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="glass-card h-11 px-4 rounded-xl text-[13px] font-medium flex items-center gap-1.5 disabled:opacity-40 hover:bg-[var(--surface-hover)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Newer
            </button>
            <p className="text-xs text-[var(--text-muted)] text-center">
              Page{" "}
              <span className="font-mono text-[var(--text-primary)]">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-mono text-[var(--text-primary)]">
                {pagination.totalPages}
              </span>
            </p>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="glass-card h-11 px-4 rounded-xl text-[13px] font-medium flex items-center gap-1.5 disabled:opacity-40 hover:bg-[var(--surface-hover)] transition-colors"
            >
              Older <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="glass-card w-full md:max-w-sm p-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))] space-y-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-t-[28px] md:rounded-[24px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="md:hidden pt-1 pb-3 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--aurora-coral)]/15 text-[var(--aurora-coral)] grid place-items-center mx-auto">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="text-center">
              <h3
                id="delete-dialog-title"
                className="font-heading font-bold text-base text-[var(--text-primary)]"
              >
                Delete this transaction?
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                It will be removed from your ledger and totals. This can&apos;t
                be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="h-11 rounded-xl text-[13px] font-semibold glass-card hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="h-11 rounded-xl text-[13px] font-semibold bg-[var(--aurora-coral)] hover:opacity-90 disabled:opacity-60 text-white transition-opacity"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <TransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingTx(null);
        }}
        transactionToEdit={editingTx}
        defaultType="EXPENSE"
      />
    </div>
  );
}

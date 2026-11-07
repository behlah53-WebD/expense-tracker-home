"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Plus,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { usePrefetch } from "@/lib/store/api/baseApi";
import { useSummary } from "@/hooks/useReports";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Income", href: "/income", icon: TrendingUp },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

// item height 44px + 4px gap = 48px pitch (used to slide the active lens)
const ITEM_H = 44;
const PITCH = 48;

function MiniRing({ value, size = 36 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="shrink-0 -rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--surface-hover)"
        strokeWidth="4"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#sb-ring)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        style={{ transition: "stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)" }}
      />
      <defs>
        <linearGradient id="sb-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent-cyan)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isExpanded, toggleSidebar } = useSidebar();
  const { data: summary } = useSummary();

  const prefetchSummary = usePrefetch("getSummary");
  const prefetchMonthly = usePrefetch("getMonthlyTrend");
  const prefetchTransactions = usePrefetch("getTransactions");
  const prefetchCategories = usePrefetch("getCategories");
  const prefetchBudgets = usePrefetch("getBudgets");

  const handlePrefetch = (href: string) => {
    if (href === "/dashboard") {
      prefetchSummary();
      prefetchMonthly();
    } else if (href === "/transactions") {
      prefetchTransactions({ limit: 10, sort: "date-desc" });
    } else if (href === "/settings") {
      prefetchCategories();
      prefetchBudgets();
    }
  };

  const activeIndex = useMemo(
    () => NAV_ITEMS.findIndex(i => pathname?.startsWith(i.href)),
    [pathname]
  );
  const savingsRate = Math.round(summary?.currentMonth?.savingsRate || 0);

  return (
    /* Outer shell keeps the original footprint (w-64 / w-20) so your page margins don't change */
    <aside
      aria-label="Desktop Sidebar Navigation"
      className={cn(
        "hidden md:block fixed top-0 left-0 h-screen z-40 p-3 select-none",
        "transition-[width] duration-300 ease-aurora motion-reduce:transition-none",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* Gradient hairline frame */}
      <div className="relative h-full rounded-[28px] p-px bg-[linear-gradient(160deg,var(--primary)_0%,var(--border)_28%,var(--border)_72%,var(--accent-cyan)_100%)] shadow-[0_24px_60px_-24px_rgba(0,0,0,.7)]">
        <div className="relative h-full rounded-[27px] bg-[var(--bg-elevated,var(--surface))] flex flex-col px-2.5">
          {/* clipped ambient glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[27px] overflow-hidden pointer-events-none"
          >
            <div className="absolute -top-16 -left-10 w-44 h-44 rounded-full bg-[var(--primary)] opacity-25 blur-3xl" />
            <div className="absolute -bottom-20 -right-12 w-48 h-48 rounded-full bg-[var(--accent-cyan)] opacity-15 blur-3xl" />
          </div>

          {/* Collapse handle sitting on the edge */}
          <button
            onClick={toggleSidebar}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="absolute -right-3 top-[88px] z-10 w-6 h-6 rounded-full grid place-items-center border border-[var(--border)] bg-[var(--bg-elevated,var(--surface))] text-[var(--text-muted)] hover:text-white hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
          >
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-300",
                isExpanded && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          {/* Brand */}
          <Link
            href="/dashboard"
            className={cn(
              "relative flex items-center h-[76px] shrink-0 group focus-visible:outline-none",
              isExpanded ? "gap-3 px-1.5" : "justify-center"
            )}
          >
            <span className="relative grid place-items-center w-11 h-11 rounded-2xl shrink-0 bg-[conic-gradient(from_210deg,var(--primary),var(--accent-cyan),var(--primary))] shadow-glow-violet group-hover:rotate-6 transition-transform duration-300">
              <span className="absolute inset-[2px] rounded-[14px] bg-[var(--bg-elevated,var(--surface))] grid place-items-center">
                <Sparkles
                  className="w-5 h-5 text-[var(--accent-cyan)]"
                  aria-hidden="true"
                />
              </span>
            </span>
            {isExpanded && (
              <span className="leading-tight whitespace-nowrap">
                <span className="block font-heading font-bold text-[17px] tracking-[-0.01em] text-[var(--text-heading)]">
                  Expense Tracker
                </span>
                <span className="block font-heading text-[12px] text-[var(--text-muted)]">
                  Ledger
                </span>
              </span>
            )}
          </Link>

          {/* New entry */}
          <Link
            href="/transactions?new=1"
            prefetch
            title={!isExpanded ? "Add transaction" : undefined}
            className={cn(
              "relative shrink-0 flex items-center justify-center gap-2 h-11 rounded-2xl text-[13px] font-semibold text-white",
              "bg-[linear-gradient(135deg,var(--primary),var(--accent-cyan))] shadow-[0_10px_28px_-10px_var(--primary)]",
              "hover:brightness-110 active:scale-[.97] transition-[filter,transform] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            )}
          >
            <Plus className="w-4 h-4 stroke-[2.6]" aria-hidden="true" />
            {isExpanded && <span>Add transaction</span>}
            {!isExpanded && <span className="sr-only">Add transaction</span>}
          </Link>

          {/* Navigation with a sliding lens behind the active item */}
          <nav aria-label="Main Navigation" className="relative mt-6 flex-1">
            <div
              className="relative"
              style={{ height: NAV_ITEMS.length * PITCH }}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 right-0 rounded-2xl pointer-events-none transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(.3,1.35,.5,1)] motion-reduce:transition-none",
                  "bg-[linear-gradient(100deg,color-mix(in_srgb,var(--primary)_32%,transparent),color-mix(in_srgb,var(--accent-cyan)_12%,transparent))]",
                  "border border-[var(--primary)]/45 shadow-[0_0_26px_-6px_var(--primary)]",
                  activeIndex < 0 && "opacity-0"
                )}
                style={{
                  height: ITEM_H,
                  transform: `translateY(${Math.max(activeIndex, 0) * PITCH}px)`,
                }}
              >
                <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_12px_var(--accent-cyan)]" />
              </span>

              <ul className="relative flex flex-col gap-1">
                {NAV_ITEMS.map((item, i) => {
                  const isActive = i === activeIndex;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch
                        aria-current={isActive ? "page" : undefined}
                        onMouseEnter={() => handlePrefetch(item.href)}
                        onFocus={() => handlePrefetch(item.href)}
                        className={cn(
                          "group relative flex items-center rounded-2xl transition-colors duration-200",
                          "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none",
                          isExpanded ? "gap-3.5 px-3.5" : "justify-center",
                          isActive
                            ? "text-[var(--text-heading)]"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-white/5"
                        )}
                        style={{ height: ITEM_H }}
                      >
                        <Icon
                          className={cn(
                            "w-[19px] h-[19px] shrink-0 transition-[transform,color,filter] duration-200 group-hover:scale-110",
                            isActive &&
                              "text-[var(--accent-cyan)] drop-shadow-[0_0_8px_var(--accent-cyan)]"
                          )}
                          aria-hidden="true"
                        />
                        {isExpanded ? (
                          <span
                            className={cn(
                              "text-[13.5px] whitespace-nowrap",
                              isActive ? "font-semibold" : "font-medium"
                            )}
                          >
                            {item.label}
                          </span>
                        ) : (
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute left-full ml-4 z-50 px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium text-[var(--text-heading)] bg-[var(--bg-elevated,var(--surface))] border border-[var(--border)] shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-[opacity,transform] duration-150"
                          >
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Month snapshot */}
          <div
            className={cn(
              "relative shrink-0 mb-3 rounded-2xl border border-[var(--border)] bg-white/[0.03]",
              isExpanded
                ? "flex items-center gap-3 p-3"
                : "grid place-items-center py-2.5"
            )}
            title={!isExpanded ? `Savings rate ${savingsRate}%` : undefined}
          >
            <div className="relative grid place-items-center">
              <MiniRing value={savingsRate} size={isExpanded ? 40 : 34} />
              {isExpanded && (
                <span className="absolute font-mono text-[10px] font-bold text-[var(--text-heading)]">
                  {savingsRate}
                </span>
              )}
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[var(--text-heading)] leading-tight">
                  Savings rate
                </p>
                <p className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">
                  {savingsRate >= 20
                    ? "On track this month"
                    : "Below the 20% goal"}
                </p>
              </div>
            )}
          </div>

          {/* Profile + sign out */}
          <div className="relative shrink-0 pb-3 pt-3 border-t border-[var(--border)]">
            {session?.user && (
              <div
                className={cn(
                  "flex items-center rounded-2xl",
                  isExpanded ? "gap-2.5 pl-1 pr-1" : "flex-col gap-2"
                )}
              >
                <div
                  className="relative w-10 h-10 rounded-full p-[2px] shrink-0 bg-[conic-gradient(from_90deg,var(--primary),var(--accent-cyan),var(--expense),var(--primary))]"
                  title={
                    !isExpanded ? session.user.name || undefined : undefined
                  }
                >
                  <div className="w-full h-full rounded-full bg-[var(--bg-elevated,var(--surface))] grid place-items-center font-heading font-bold text-sm text-[var(--text-heading)] uppercase">
                    {session.user.name?.[0] || "U"}
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--income)] border-2 border-[var(--bg-elevated,var(--surface))]"
                    aria-hidden="true"
                  />
                </div>

                {isExpanded && (
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[var(--text-heading)] truncate leading-tight">
                      {session.user.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight mt-0.5">
                      {session.user.email}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  aria-label="Sign out"
                  title="Sign out"
                  className="group shrink-0 w-9 h-9 grid place-items-center rounded-xl text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--danger)] focus-visible:outline-none"
                >
                  <LogOut
                    className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

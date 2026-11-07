"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Sun,
  Moon,
  Plus,
  Bell,
  Search,
  Sparkles,
  Sunrise,
  Sunset,
  X,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { useDebounce } from "@/hooks/useDebounce";

interface TopbarProps {
  onOpenAddModal: () => void;
  onSearch?: (q: string) => void;
}

const PERIODS = [
  { max: 12, text: "Good morning", Icon: Sunrise },
  { max: 17, text: "Good afternoon", Icon: Sun },
  { max: 21, text: "Good evening", Icon: Sunset },
  { max: 25, text: "Good night", Icon: Moon },
];

export function Topbar({ onOpenAddModal, onSearch }: TopbarProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  // kept so the component stays in sync with the sidebar context (collapse handle now lives on the sidebar itself)
  useSidebar();

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    if (onSearch) onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  // condense the bar once the page (or any scroll container) moves
  useEffect(() => {
    const onScroll = (e: Event) => {
      const t = e.target as any;
      const y = typeof t?.scrollTop === "number" ? t.scrollTop : window.scrollY;
      setScrolled(y > 8);
    };
    window.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  // Ctrl/⌘ + K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.matchMedia("(min-width:1024px)").matches)
          searchRef.current?.focus();
        else setMobileSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue("");
    searchRef.current?.focus();
  }, []);

  const hour = now?.getHours() ?? 12;
  const period = PERIODS.find(p => hour < p.max) || PERIODS[0];
  const PeriodIcon = period.Icon;
  const firstName = session?.user?.name
    ? session.user.name.split(" ")[0]
    : "Friend";
  const dateText = now
    ? new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }).format(now)
    : "";
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-4 md:px-6 lg:px-8 pt-3 pointer-events-none">
      {/* gradient hairline frame */}
      <div
        className={`pointer-events-auto mx-auto max-w-[1600px] rounded-[26px] p-px transition-shadow duration-300 bg-[linear-gradient(120deg,var(--primary)_0%,var(--border)_30%,var(--border)_70%,var(--accent-cyan)_100%)] ${
          scrolled
            ? "shadow-[0_18px_50px_-18px_rgba(0,0,0,.75)]"
            : "shadow-[0_10px_30px_-18px_rgba(0,0,0,.5)]"
        }`}
      >
        <div className="relative rounded-[25px] bg-[var(--surface)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] overflow-hidden">
          {/* ambient glow */}
          <div
            aria-hidden="true"
            className="absolute -top-10 left-8 w-48 h-24 rounded-full bg-[var(--primary)] opacity-20 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-10 right-24 w-48 h-24 rounded-full bg-[var(--accent-cyan)] opacity-10 blur-3xl pointer-events-none"
          />

          <div
            className={`relative flex items-center justify-between gap-3 px-3 sm:px-4 transition-[height] duration-300 ${scrolled ? "h-[60px]" : "h-[72px]"}`}
          >
            {/* Left: greeting */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative grid place-items-center w-11 h-11 shrink-0 rounded-2xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_28%,transparent),color-mix(in_srgb,var(--accent-cyan)_16%,transparent))] border border-[var(--primary)]/30">
                <PeriodIcon
                  className="w-5 h-5 text-[var(--accent-cyan)] drop-shadow-[0_0_8px_var(--accent-cyan)]"
                  aria-hidden="true"
                />
              </span>
              <div className="min-w-0">
                <h1 className="font-heading font-bold text-[15px] sm:text-[17px] leading-tight tracking-[-0.01em] text-[var(--text-heading)] truncate">
                  {period.text}, {firstName}
                </h1>
                <p
                  className={`text-xs text-[var(--text-muted)] truncate transition-[max-height,opacity] duration-300 ${
                    scrolled
                      ? "max-h-0 opacity-0"
                      : "max-h-5 opacity-100 mt-0.5"
                  }`}
                >
                  {dateText || "\u00A0"}
                </p>
              </div>
            </div>

            {/* Center: command-style search (desktop) */}
            <div className="hidden lg:block flex-1 max-w-[420px] mx-auto">
              <div className="group relative">
                <Search
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Escape") {
                      setSearchValue("");
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="Search transactions"
                  aria-label="Search transactions"
                  className="w-full h-11 pl-10 pr-20 rounded-2xl text-[13px] text-[var(--text-heading)] placeholder:text-[var(--text-muted)] bg-white/[0.04] border border-[var(--border)] transition-[box-shadow,border-color,background] duration-200 focus:outline-none focus:border-[var(--primary)] focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_18%,transparent)]"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                  {searchValue ? (
                    <button
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="w-6 h-6 grid place-items-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-white/10"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <kbd className="font-mono text-[10px] text-[var(--text-muted)] px-1.5 py-1 rounded-md border border-[var(--border)] bg-white/5">
                      {isMac ? "⌘" : "Ctrl"} K
                    </kbd>
                  )}
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <button
                onClick={() => setMobileSearch(v => !v)}
                aria-label="Search"
                aria-expanded={mobileSearch}
                className="lg:hidden w-10 h-10 grid place-items-center rounded-2xl border border-[var(--border)] bg-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Add transaction */}
              <button
                onClick={onOpenAddModal}
                aria-label="Add transaction"
                className="group relative overflow-hidden h-10 sm:h-11 w-10 sm:w-auto sm:px-5 inline-flex items-center justify-center gap-2 rounded-2xl text-[13px] font-semibold text-white bg-[linear-gradient(135deg,var(--primary),var(--accent-cyan))] shadow-[0_10px_26px_-10px_var(--primary)] active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/30 group-hover:left-[130%] transition-[left] duration-700 motion-reduce:hidden"
                />
                <Plus
                  className="relative w-4 h-4 stroke-[2.6]"
                  aria-hidden="true"
                />
                <span className="relative hidden sm:inline">
                  Add transaction
                </span>
              </button>

              <span
                aria-hidden="true"
                className="hidden sm:block w-px h-6 bg-[var(--border)]"
              />

              {/* Theme switch */}
              {mounted ? (
                <button
                  role="switch"
                  aria-checked={isDark}
                  aria-label="Dark mode"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="relative hidden sm:block w-[68px] h-10 rounded-full border border-[var(--border)] bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
                >
                  <Sun
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300"
                    aria-hidden="true"
                  />
                  <Moon
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
                    aria-hidden="true"
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute top-1 left-1 w-8 h-8 rounded-full grid place-items-center bg-[var(--bg-elevated)] border border-[var(--primary)]/40 shadow-[0_0_14px_-2px_var(--primary)] transition-transform duration-300 ease-[cubic-bezier(.3,1.35,.5,1)] motion-reduce:transition-none ${
                      isDark ? "translate-x-[28px]" : "translate-x-0"
                    }`}
                  >
                    {isDark ? (
                      <Moon className="w-4 h-4 text-[var(--primary)]" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-400" />
                    )}
                  </span>
                </button>
              ) : (
                <span
                  className="hidden sm:block w-[68px] h-10"
                  aria-hidden="true"
                />
              )}

              {/* Theme toggle for small screens */}
              {mounted && (
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label="Toggle theme"
                  className="sm:hidden w-10 h-10 grid place-items-center rounded-2xl border border-[var(--border)] bg-white/[0.04] text-[var(--text-secondary)]"
                >
                  {isDark ? (
                    <Sun
                      className="w-4 h-4 text-amber-300"
                      aria-hidden="true"
                    />
                  ) : (
                    <Moon
                      className="w-4 h-4 text-[var(--primary)]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )}

              {/* Notifications */}
              <button
                aria-label="Notifications"
                className="relative w-10 h-10 hidden sm:grid place-items-center rounded-2xl border border-[var(--border)] bg-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                <span
                  className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[var(--income)] shadow-glow-mint"
                  aria-hidden="true"
                />
              </button>

              {/* Avatar */}
              <Link
                href="/settings"
                prefetch
                aria-label="Profile and settings"
                className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-[conic-gradient(from_90deg,var(--primary),var(--accent-cyan),var(--expense),var(--primary))] transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
              >
                <span className="w-full h-full rounded-full bg-[var(--bg-elevated)] grid place-items-center font-heading font-bold text-sm text-[var(--text-heading)] uppercase">
                  {session?.user?.name ? (
                    session.user.name[0]
                  ) : (
                    <Sparkles
                      className="w-4 h-4 text-[var(--income)]"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile / tablet search row */}
          {mobileSearch && (
            <div className="lg:hidden relative px-3 sm:px-4 pb-3">
              <Search
                className="w-4 h-4 absolute left-7 sm:left-8 top-1/2 -translate-y-[60%] text-[var(--text-muted)] pointer-events-none"
                aria-hidden="true"
              />
              <input
                autoFocus
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onKeyDown={e => e.key === "Escape" && setMobileSearch(false)}
                placeholder="Search transactions"
                aria-label="Search transactions"
                className="w-full h-11 pl-10 pr-4 rounded-2xl text-base text-[var(--text-heading)] placeholder:text-[var(--text-muted)] bg-white/[0.05] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

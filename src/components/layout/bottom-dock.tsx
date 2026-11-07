"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomDockProps {
  onOpenAddModal: () => void;
}

export function BottomDock({ onOpenAddModal }: BottomDockProps) {
  const pathname = usePathname();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initialHeight = window.visualViewport?.height ?? window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height ?? window.innerHeight;
      setIsKeyboardOpen(initialHeight - currentHeight > 150);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      return () => window.visualViewport!.removeEventListener("resize", handleResize);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const haptic = () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore if blocked by browser
      }
    }
  };

  if (isKeyboardOpen) return null;

  const isHomeActive = pathname === "/dashboard" || pathname === "/";
  const isHistoryActive = pathname === "/transactions" || pathname === "/income";
  const isReportsActive = pathname === "/reports";
  const isSettingsActive = pathname === "/settings";

  return (
    <div className="fixed bottom-[calc(14px+env(safe-area-inset-bottom,0px))] left-3 right-3 z-50 md:hidden max-w-md mx-auto pointer-events-auto overflow-visible">
      <nav
        aria-label="Mobile Navigation Dock"
        className="relative rounded-[28px] border border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.7)] px-2 py-1.5 overflow-visible"
      >
        <div className="grid grid-cols-5 items-center relative overflow-visible">
          {/* Tab 1: Home */}
          <Link
            href="/dashboard"
            prefetch={true}
            onClick={haptic}
            className={cn(
              "flex flex-col items-center justify-center h-12 rounded-2xl transition-all duration-200 relative group",
              isHomeActive
                ? "text-[var(--accent-cyan)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
            )}
            aria-label="Home"
          >
            <div
              className={cn(
                "absolute inset-x-1.5 inset-y-1 rounded-xl transition-all duration-300 pointer-events-none",
                isHomeActive
                  ? "bg-[var(--primary)]/15 shadow-[0_0_12px_rgba(124,92,255,0.2)]"
                  : "opacity-0 scale-90"
              )}
              aria-hidden="true"
            />
            <LayoutDashboard
              className={cn(
                "w-5 h-5 transition-transform duration-200 relative z-10",
                isHomeActive
                  ? "scale-110 drop-shadow-[0_0_8px_var(--accent-cyan)]"
                  : "group-hover:scale-105"
              )}
              aria-hidden="true"
            />
            <span className="text-[10px] mt-0.5 tracking-tight relative z-10 leading-tight">
              Home
            </span>
            <div
              aria-hidden="true"
              className={cn(
                "w-1 h-1 rounded-full bg-[var(--primary)] shadow-[0_0_6px_var(--primary-glow)] mt-0.5 transition-all duration-200",
                isHomeActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
            />
          </Link>

          {/* Tab 2: History (Transactions & Income) */}
          <Link
            href="/transactions"
            prefetch={true}
            onClick={haptic}
            className={cn(
              "flex flex-col items-center justify-center h-12 rounded-2xl transition-all duration-200 relative group",
              isHistoryActive
                ? "text-[var(--accent-cyan)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
            )}
            aria-label="History"
          >
            <div
              className={cn(
                "absolute inset-x-1.5 inset-y-1 rounded-xl transition-all duration-300 pointer-events-none",
                isHistoryActive
                  ? "bg-[var(--primary)]/15 shadow-[0_0_12px_rgba(124,92,255,0.2)]"
                  : "opacity-0 scale-90"
              )}
              aria-hidden="true"
            />
            <ArrowLeftRight
              className={cn(
                "w-5 h-5 transition-transform duration-200 relative z-10",
                isHistoryActive
                  ? "scale-110 drop-shadow-[0_0_8px_var(--accent-cyan)]"
                  : "group-hover:scale-105"
              )}
              aria-hidden="true"
            />
            <span className="text-[10px] mt-0.5 tracking-tight relative z-10 leading-tight">
              History
            </span>
            <div
              aria-hidden="true"
              className={cn(
                "w-1 h-1 rounded-full bg-[var(--primary)] shadow-[0_0_6px_var(--primary-glow)] mt-0.5 transition-all duration-200",
                isHistoryActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
            />
          </Link>

          {/* Tab 3: Center Raised Glowing Add Button */}
          <div className="relative flex flex-col items-center justify-center h-12 overflow-visible">
            <button
              type="button"
              onClick={() => {
                haptic();
                onOpenAddModal();
              }}
              className="absolute -top-5 w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[var(--primary)] via-[var(--accent-cyan)] to-[var(--income)] text-white flex items-center justify-center shadow-[0_0_24px_rgba(124,92,255,0.55),0_8px_20px_rgba(0,0,0,0.5)] border-2 border-white/40 hover:scale-105 active:scale-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] pointer-events-auto"
              aria-label="Add transaction"
            >
              <Plus className="w-6 h-6 stroke-[2.75]" aria-hidden="true" />
            </button>
            <span className="text-[10px] font-semibold text-[var(--text-muted)] tracking-tight mt-6 relative z-10 leading-tight">
              Add
            </span>
          </div>

          {/* Tab 4: Reports */}
          <Link
            href="/reports"
            prefetch={true}
            onClick={haptic}
            className={cn(
              "flex flex-col items-center justify-center h-12 rounded-2xl transition-all duration-200 relative group",
              isReportsActive
                ? "text-[var(--accent-cyan)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
            )}
            aria-label="Reports"
          >
            <div
              className={cn(
                "absolute inset-x-1.5 inset-y-1 rounded-xl transition-all duration-300 pointer-events-none",
                isReportsActive
                  ? "bg-[var(--primary)]/15 shadow-[0_0_12px_rgba(124,92,255,0.2)]"
                  : "opacity-0 scale-90"
              )}
              aria-hidden="true"
            />
            <BarChart3
              className={cn(
                "w-5 h-5 transition-transform duration-200 relative z-10",
                isReportsActive
                  ? "scale-110 drop-shadow-[0_0_8px_var(--accent-cyan)]"
                  : "group-hover:scale-105"
              )}
              aria-hidden="true"
            />
            <span className="text-[10px] mt-0.5 tracking-tight relative z-10 leading-tight">
              Reports
            </span>
            <div
              aria-hidden="true"
              className={cn(
                "w-1 h-1 rounded-full bg-[var(--primary)] shadow-[0_0_6px_var(--primary-glow)] mt-0.5 transition-all duration-200",
                isReportsActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
            />
          </Link>

          {/* Tab 5: Settings */}
          <Link
            href="/settings"
            prefetch={true}
            onClick={haptic}
            className={cn(
              "flex flex-col items-center justify-center h-12 rounded-2xl transition-all duration-200 relative group",
              isSettingsActive
                ? "text-[var(--accent-cyan)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
            )}
            aria-label="Settings"
          >
            <div
              className={cn(
                "absolute inset-x-1.5 inset-y-1 rounded-xl transition-all duration-300 pointer-events-none",
                isSettingsActive
                  ? "bg-[var(--primary)]/15 shadow-[0_0_12px_rgba(124,92,255,0.2)]"
                  : "opacity-0 scale-90"
              )}
              aria-hidden="true"
            />
            <Settings
              className={cn(
                "w-5 h-5 transition-transform duration-200 relative z-10",
                isSettingsActive
                  ? "scale-110 drop-shadow-[0_0_8px_var(--accent-cyan)]"
                  : "group-hover:scale-105"
              )}
              aria-hidden="true"
            />
            <span className="text-[10px] mt-0.5 tracking-tight relative z-10 leading-tight">
              Settings
            </span>
            <div
              aria-hidden="true"
              className={cn(
                "w-1 h-1 rounded-full bg-[var(--primary)] shadow-[0_0_6px_var(--primary-glow)] mt-0.5 transition-all duration-200",
                isSettingsActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
            />
          </Link>
        </div>
      </nav>
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  WifiOff,
  ArrowDownLeft,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Usage (login and register pages):
 *
 *   <AuthShell>
 *     ...your existing form...
 *   </AuthShell>
 *
 * Mobile  : one fixed screen, never scrolls. Compact header on top, form sheet fills the rest.
 *           While a field is focused (keyboard open) the header strip collapses to give the form room.
 * Desktop : two-column layout with the full animated showcase on the left.
 */

/* ───────────── shell ───────────── */

export function AuthShell({ children }: { children: React.ReactNode }) {
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onFocus = useCallback((e: React.FocusEvent) => {
    if (
      e.target instanceof HTMLElement &&
      /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
    ) {
      if (timer.current) clearTimeout(timer.current);
      setTyping(true);
    }
  }, []);
  const onBlur = useCallback(() => {
    // small delay so moving between fields doesn't flicker the layout
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTyping(false), 120);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return (
    <main
      onFocusCapture={onFocus}
      onBlurCapture={onBlur}
      className="fixed inset-0 flex flex-col overscroll-none bg-[var(--bg-base)] lg:static lg:grid lg:grid-cols-2 lg:min-h-dvh"
    >
      <AuthVisualHero compact={typing} />
      <AuthFormSheet>{children}</AuthFormSheet>
    </main>
  );
}

/* ───────────── hero ───────────── */

export function AuthVisualHero({ compact = false }: { compact?: boolean }) {
  const tiltRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || !tiltRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    tiltRef.current.style.transform = `rotateX(${-y * 0.025}deg) rotateY(${x * 0.025}deg)`;
  };
  const onLeave = () => {
    if (tiltRef.current)
      tiltRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <section
      aria-label="Aurora Ledger"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate shrink-0 overflow-hidden flex flex-col px-5 pt-[max(0.9rem,env(safe-area-inset-top))] pb-9 lg:min-h-dvh lg:justify-between lg:p-12 lg:pb-12 bg-gradient-to-br from-[var(--bg-base)] via-[var(--bg-elevated)] to-[var(--bg-base)] lg:border-r border-[var(--border)]"
    >
      <style>{`
        @keyframes dxa-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes dxa-draw{from{stroke-dashoffset:320}to{stroke-dashoffset:0}}
        @keyframes dxa-drift{to{transform:translate3d(30px,24px,0) scale(1.1)}}
        .dxa-float{animation:dxa-float 6s ease-in-out infinite}
        .dxa-float-b{animation:dxa-float 7.5s ease-in-out -2s infinite}
        .dxa-draw{stroke-dasharray:320;animation:dxa-draw 1.6s .2s cubic-bezier(.2,.8,.2,1) both}
        .dxa-orb{animation:dxa-drift 20s ease-in-out infinite alternate}
        .dxa-dots{background-image:radial-gradient(color-mix(in srgb,var(--text-muted) 35%,transparent) 1px,transparent 1px);background-size:22px 22px;
          -webkit-mask-image:radial-gradient(ellipse at 50% 40%,#000 25%,transparent 75%);mask-image:radial-gradient(ellipse at 50% 40%,#000 25%,transparent 75%)}
        @media (prefers-reduced-motion:reduce){.dxa-float,.dxa-float-b,.dxa-orb{animation:none}.dxa-draw{animation:none;stroke-dasharray:none}}
      `}</style>

      {/* ambient layers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
      >
        <div className="dxa-dots absolute inset-0 opacity-40" />
        <div className="dxa-orb absolute -top-20 -left-20 w-64 h-64 lg:w-96 lg:h-96 rounded-full bg-[var(--primary)]/30 blur-[80px] lg:blur-[90px]" />
        <div
          className="dxa-orb absolute top-1/3 -right-20 w-52 h-52 lg:w-80 lg:h-80 rounded-full bg-[var(--accent-cyan)]/20 blur-[80px] lg:blur-[90px]"
          style={{ animationDuration: "26s" }}
        />
        <div
          className="dxa-orb hidden lg:block absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-[var(--expense)]/15 blur-[100px]"
          style={{ animationDuration: "32s" }}
        />
      </div>

      {/* Brand row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 lg:gap-3">
          <span className="relative grid place-items-center w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-[conic-gradient(from_210deg,var(--primary),var(--accent-cyan),var(--primary))] shadow-glow-violet">
            <span className="absolute inset-[2px] rounded-[14px] bg-[var(--bg-elevated)] grid place-items-center">
              <Sparkles
                className="w-[18px] h-[18px] lg:w-6 lg:h-6 text-[var(--accent-cyan)]"
                aria-hidden="true"
              />
            </span>
          </span>
          <div className="flex items-baseline gap-1.5 lg:block lg:leading-tight">
            <span className="font-heading font-bold text-lg lg:text-2xl tracking-[-0.01em] text-[var(--text-heading)] lg:block">
              Aurora
            </span>
            <span className="font-heading text-xs text-[var(--text-muted)] lg:block">
              Ledger
            </span>
          </div>
        </div>

        <span className="lg:hidden inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
          <ShieldCheck
            className="w-3.5 h-3.5 text-[var(--income)]"
            aria-hidden="true"
          />{" "}
          Secure
        </span>
      </div>

      {/* MOBILE: slim balance strip (collapses while typing, hidden on very short screens) */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out [@media(max-height:640px)]:hidden",
          compact ? "max-h-0 opacity-0 mt-0" : "max-h-24 opacity-100 mt-4"
        )}
        aria-hidden={compact}
      >
        <div className="rounded-2xl p-px bg-[linear-gradient(120deg,var(--primary),var(--border)_40%,var(--border)_60%,var(--accent-cyan))] shadow-[0_16px_36px_-18px_rgba(124,92,255,.5)]">
          <div className="flex items-center justify-between gap-3 rounded-[15px] bg-[var(--surface)] backdrop-blur-xl px-4 py-3">
            <div className="min-w-0">
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[var(--income)] animate-pulse"
                  aria-hidden="true"
                />{" "}
                Net worth
              </p>
              <p className="mt-0.5 font-mono font-extrabold text-[22px] leading-none tracking-tight text-[var(--text-heading)]">
                ₹1,24,580
                <span className="text-[var(--accent-cyan)] text-base">.00</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] font-mono font-bold text-[var(--income-text)] bg-[var(--income)]/15 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" aria-hidden="true" /> +18.4%
              </span>
              <svg
                viewBox="0 0 100 28"
                className="w-[88px] h-6"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="dxaLineM" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C5CFF" />
                    <stop offset="55%" stopColor="#38D5FF" />
                    <stop offset="100%" stopColor="#2EF2B0" />
                  </linearGradient>
                </defs>
                <path
                  className="dxa-draw"
                  d="M0,22 Q15,25 30,17 T60,12 T85,6 L100,3"
                  fill="none"
                  stroke="url(#dxaLineM)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP: full showcase */}
      <div className="hidden lg:flex my-auto py-10 flex-col items-center [perspective:1000px]">
        <div className="relative w-full max-w-sm">
          <div className="dxa-float absolute -top-5 -right-10 z-10 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur-md px-3 py-2 shadow-[0_12px_30px_-12px_rgba(0,0,0,.7)]">
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-[var(--income)]/15 text-[var(--income)]">
              <ArrowDownLeft className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] text-[var(--text-muted)]">
                Salary credited
              </p>
              <p className="font-mono text-xs font-bold text-[var(--income-text)]">
                +₹42,000
              </p>
            </div>
          </div>

          <div className="dxa-float-b absolute -bottom-5 -left-10 z-10 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur-md px-3 py-2 shadow-[0_12px_30px_-12px_rgba(0,0,0,.7)]">
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-[var(--expense)]/15 text-[var(--expense-text)]">
              <Coffee className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] text-[var(--text-muted)]">Cafe</p>
              <p className="font-mono text-xs font-bold text-[var(--expense-text)]">
                −₹240
              </p>
            </div>
          </div>

          <div
            ref={tiltRef}
            className="relative rounded-[28px] p-px transition-transform duration-200 ease-out bg-[linear-gradient(140deg,var(--primary),var(--border)_35%,var(--border)_65%,var(--accent-cyan))] shadow-[0_30px_60px_-20px_rgba(0,0,0,.65),0_0_40px_-8px_rgba(124,92,255,.35)]"
          >
            <div className="rounded-[27px] bg-[var(--surface)] backdrop-blur-2xl p-7">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full bg-[var(--income)] shadow-glow-mint animate-pulse"
                    aria-hidden="true"
                  />
                  Net worth
                </span>
                <span className="text-xs font-mono font-bold text-[var(--income-text)] bg-[var(--income)]/15 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />{" "}
                  +18.4%
                </span>
              </div>
              <p className="mt-4 font-mono font-extrabold tracking-tight text-4xl text-[var(--text-heading)]">
                ₹1,24,580
                <span className="text-[var(--accent-cyan)] text-2xl">.00</span>
              </p>
              <div className="mt-5 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
                  <span>Last 6 months</span>
                  <span className="text-[var(--accent-cyan)] font-mono font-semibold">
                    High growth
                  </span>
                </div>
                <svg
                  viewBox="0 0 200 48"
                  className="w-full h-12"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="dxaLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7C5CFF" />
                      <stop offset="55%" stopColor="#38D5FF" />
                      <stop offset="100%" stopColor="#2EF2B0" />
                    </linearGradient>
                    <linearGradient id="dxaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38D5FF" stopOpacity=".28" />
                      <stop offset="100%" stopColor="#38D5FF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,38 Q30,42 60,30 T120,22 T170,10 L200,5 L200,48 L0,48 Z"
                    fill="url(#dxaFill)"
                  />
                  <path
                    className="dxa-draw"
                    d="M0,38 Q30,42 60,30 T120,22 T170,10 L200,5"
                    fill="none"
                    stroke="url(#dxaLine)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="200" cy="5" r="4" fill="#2EF2B0" />
                  <circle cx="200" cy="5" r="8" fill="#2EF2B0" opacity=".25" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center max-w-sm">
          <h2 className="font-heading font-bold text-3xl tracking-[-0.02em] text-[var(--text-heading)]">
            Watch your money glow.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Turn every transaction into living northern lights. Income arrives
            as mint and emerald, expenses flow in coral, and your balance orb
            pulses with your financial health.
          </p>
        </div>
      </div>

      {/* Trust badges (desktop) */}
      <ul className="hidden lg:grid grid-cols-3 gap-3 text-xs text-[var(--text-secondary)]">
        {[
          {
            Icon: ShieldCheck,
            text: "Bank-grade encryption",
            color: "var(--income)",
          },
          {
            Icon: Zap,
            text: "Instant insights and sync",
            color: "var(--accent-gold)",
          },
          {
            Icon: WifiOff,
            text: "Works offline as an app",
            color: "var(--accent-cyan)",
          },
        ].map(({ Icon, text, color }) => (
          <li
            key={text}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2.5"
          >
            <Icon
              className="w-4 h-4 shrink-0"
              style={{ color }}
              aria-hidden="true"
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── form sheet ───────────── */

export function AuthFormSheet({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // fills whatever height is left under the hero; scrolls internally only as a last resort (e.g. keyboard open on a tiny screen)
        "relative z-10 flex flex-col flex-1 min-h-0 -mt-6 lg:mt-0 overflow-y-auto overscroll-contain lg:overflow-visible",
        "rounded-t-[30px] lg:rounded-none bg-[var(--bg-elevated)] border-t border-[var(--border)] lg:border-0",
        "px-5 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-12 lg:py-12",
        "shadow-[0_-24px_50px_-20px_rgba(0,0,0,.65)] lg:shadow-none [-webkit-overflow-scrolling:touch]",
        className
      )}
    >
      <div
        className="lg:hidden mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-white/15"
        aria-hidden="true"
      />
      {/* my-auto centres the form vertically when there is spare room, and stays scroll-safe when there isn't */}
      <div className="w-full max-w-md mx-auto my-auto">{children}</div>
    </div>
  );
}

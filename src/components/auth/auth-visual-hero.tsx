"use client";

import React, { useRef } from "react";
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
 * AuthVisualHero
 *  - lg+      : full-height brand panel (left half of the login screen)
 *  - < lg     : compact app-style header that sits above the form
 *
 * AuthFormSheet
 *  - wrap your login/register form in it. On phones it becomes a rounded
 *    "bottom sheet" that slides up over the hero; on desktop it is a centered column.
 */

export function AuthVisualHero() {
  const tiltRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
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
      className="relative isolate overflow-hidden flex flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-12 lg:min-h-dvh lg:justify-between lg:p-12 bg-gradient-to-br from-[var(--bg-base)] via-[var(--bg-elevated)] to-[var(--bg-base)] lg:border-r border-[var(--border)]"
    >
      <style>{`
        @keyframes dxa-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes dxa-draw{from{stroke-dashoffset:320}to{stroke-dashoffset:0}}
        @keyframes dxa-drift{to{transform:translate3d(30px,24px,0) scale(1.1)}}
        .dxa-float{animation:dxa-float 6s ease-in-out infinite}
        .dxa-float-b{animation:dxa-float 7.5s ease-in-out -2s infinite}
        .dxa-draw{stroke-dasharray:320;animation:dxa-draw 1.8s .3s cubic-bezier(.2,.8,.2,1) both}
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
        <div className="dxa-orb absolute -top-24 -left-24 w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-[var(--primary)]/30 blur-[90px]" />
        <div
          className="dxa-orb absolute top-1/3 -right-24 w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-[var(--accent-cyan)]/20 blur-[90px]"
          style={{ animationDuration: "26s" }}
        />
        <div
          className="dxa-orb absolute -bottom-24 left-1/4 w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-[var(--expense)]/15 blur-[100px]"
          style={{ animationDuration: "32s" }}
        />
      </div>

      {/* Brand row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative grid place-items-center w-11 h-11 lg:w-12 lg:h-12 rounded-2xl bg-[conic-gradient(from_210deg,var(--primary),var(--accent-cyan),var(--primary))] shadow-glow-violet">
            <span className="absolute inset-[2px] rounded-[14px] bg-[var(--bg-elevated)] grid place-items-center">
              <Sparkles
                className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--accent-cyan)]"
                aria-hidden="true"
              />
            </span>
          </span>
          <div className="leading-tight">
            <span className="block font-heading font-bold text-xl lg:text-2xl tracking-[-0.01em] text-[var(--text-heading)]">
              Aurora
            </span>
            <span className="block font-heading text-xs text-[var(--text-muted)]">
              Ledger
            </span>
          </div>
        </div>

        <span className="lg:hidden inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/5 px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
          <ShieldCheck
            className="w-3.5 h-3.5 text-[var(--income)]"
            aria-hidden="true"
          />{" "}
          Secure
        </span>
      </div>

      {/* Showcase */}
      <div className="my-auto pt-8 pb-2 lg:py-10 flex flex-col items-center [perspective:1000px]">
        <div className="relative w-full max-w-[330px] lg:max-w-sm">
          {/* floating chip: income */}
          <div className="dxa-float absolute -top-5 -right-2 lg:-right-10 z-10 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur-md px-3 py-2 shadow-[0_12px_30px_-12px_rgba(0,0,0,.7)]">
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

          {/* floating chip: expense */}
          <div className="dxa-float-b absolute -bottom-5 -left-2 lg:-left-10 z-10 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur-md px-3 py-2 shadow-[0_12px_30px_-12px_rgba(0,0,0,.7)]">
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

          {/* tilting glass card */}
          <div
            ref={tiltRef}
            className="relative rounded-[28px] p-px transition-transform duration-200 ease-out bg-[linear-gradient(140deg,var(--primary),var(--border)_35%,var(--border)_65%,var(--accent-cyan))] shadow-[0_30px_60px_-20px_rgba(0,0,0,.65),0_0_40px_-8px_rgba(124,92,255,.35)]"
          >
            <div className="rounded-[27px] bg-[var(--surface)] backdrop-blur-2xl p-5 lg:p-7">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] lg:text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full bg-[var(--income)] shadow-glow-mint animate-pulse"
                    aria-hidden="true"
                  />
                  Net worth
                </span>
                <span className="text-[11px] lg:text-xs font-mono font-bold text-[var(--income-text)] bg-[var(--income)]/15 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />{" "}
                  +18.4%
                </span>
              </div>

              <p className="mt-3 lg:mt-4 font-mono font-extrabold tracking-tight text-[32px] lg:text-4xl text-[var(--text-heading)]">
                ₹1,24,580
                <span className="text-[var(--accent-cyan)] text-xl lg:text-2xl">
                  .00
                </span>
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
                  className="w-full h-11 lg:h-12"
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

        {/* headline */}
        <div className="mt-10 lg:mt-12 text-center max-w-sm">
          <h2 className="font-heading font-bold text-[22px] lg:text-3xl tracking-[-0.02em] text-[var(--text-heading)]">
            Watch your money glow.
          </h2>
          <p className="mt-2 text-[13px] lg:text-sm leading-relaxed text-[var(--text-secondary)]">
            <span className="lg:hidden">
              Track spending, grow savings and see your finances in a whole new
              light.
            </span>
            <span className="hidden lg:inline">
              Turn every transaction into living northern lights. Income arrives
              as mint and emerald, expenses flow in coral, and your balance orb
              pulses with your financial health.
            </span>
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
        "relative z-10 flex-1 flex flex-col justify-center -mt-7 lg:mt-0",
        "rounded-t-[32px] lg:rounded-none bg-[var(--bg-elevated)] border-t border-[var(--border)] lg:border-0",
        "px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:px-12 lg:py-12",
        "shadow-[0_-24px_50px_-20px_rgba(0,0,0,.65)] lg:shadow-none",
        className
      )}
    >
      <div
        className="lg:hidden mx-auto mb-5 h-1 w-10 rounded-full bg-white/15"
        aria-hidden="true"
      />
      <div className="w-full max-w-md mx-auto">{children}</div>
    </div>
  );
}

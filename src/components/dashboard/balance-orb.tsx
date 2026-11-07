"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, AlertCircle } from "lucide-react";

interface BalanceOrbProps {
  savingsRate: number; // e.g. 28.5%
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function BalanceOrbBase({
  savingsRate,
  size = "md",
  showLabel = true,
}: BalanceOrbProps) {
  // Determine state based on savings rate:
  // >=20%: Healthy (mint / emerald)
  // 5% - 19.9%: Caution (amber / gold)
  // <5%: Overspending (coral / magenta)
  const isHealthy = savingsRate >= 20;
  const isCaution = savingsRate >= 5 && savingsRate < 20;

  const config = isHealthy
    ? {
        label: "Healthy",
        subtext: "Savings rate ≥ 20%",
        icon: TrendingUp,
        primaryColor: "var(--income)",
        secondaryColor: "var(--income-deep)",
        glowColor: "rgba(46, 242, 176, 0.45)",
        ambientGlow: "rgba(46, 242, 176, 0.15)",
        textColor: "text-[var(--income-text)]",
        borderColor: "border-[var(--income)]/30",
        bgColor: "bg-[var(--income)]/10",
      }
    : isCaution
    ? {
        label: "Caution",
        subtext: "Savings rate 5% - 20%",
        icon: AlertTriangle,
        primaryColor: "var(--accent-gold)",
        secondaryColor: "var(--text-gold)",
        glowColor: "rgba(255, 200, 87, 0.45)",
        ambientGlow: "rgba(255, 200, 87, 0.15)",
        textColor: "text-[var(--text-gold)]",
        borderColor: "border-[var(--accent-gold)]/30",
        bgColor: "bg-[var(--accent-gold)]/10",
      }
    : {
        label: "Attention",
        subtext: "Savings rate < 5%",
        icon: AlertCircle,
        primaryColor: "var(--expense)",
        secondaryColor: "var(--danger)",
        glowColor: "rgba(255, 92, 138, 0.45)",
        ambientGlow: "rgba(255, 92, 138, 0.15)",
        textColor: "text-[var(--expense-text)]",
        borderColor: "border-[var(--expense)]/30",
        bgColor: "bg-[var(--expense)]/10",
      };

  const sizeDimensions = {
    sm: "w-20 h-20",
    md: "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36",
    lg: "w-40 h-40 md:w-48 md:h-48",
  }[size];

  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Outer ambient blur glow */}
      <div
        aria-hidden="true"
        className="absolute w-44 h-44 rounded-full blur-[45px] transition-colors duration-700 pointer-events-none"
        style={{ background: config.ambientGlow }}
      />

      {/* Sphere Container */}
      <div
        className={`relative ${sizeDimensions} rounded-full flex items-center justify-center animate-orb-pulse`}
        style={{
          boxShadow: `0 0 35px ${config.glowColor}, inset 0 0 25px ${config.secondaryColor}`,
        }}
      >
        {/* Core sphere gradient */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-700 overflow-hidden"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${config.primaryColor} 0%, ${config.secondaryColor} 60%, var(--bg-elevated) 100%)`,
          }}
        >
          {/* Specular highlight gloss */}
          <div className="absolute top-1 left-2 w-3/4 h-1/2 rounded-full bg-gradient-to-b from-white/40 to-transparent blur-[1px] transform -rotate-12 pointer-events-none" />

          {/* Secondary bottom soft glow */}
          <div
            className="absolute -bottom-2 -right-2 w-2/3 h-2/3 rounded-full opacity-60 blur-md pointer-events-none"
            style={{ background: config.secondaryColor }}
          />
        </div>

        {/* Rotating light highlight ring */}
        <div className="absolute inset-[-4px] rounded-full animate-rotate-slow pointer-events-none">
          <div
            className="w-1/2 h-1/2 rounded-tl-full"
            style={{
              background: `linear-gradient(135deg, ${config.primaryColor}, transparent 70%)`,
              filter: "blur(2px)",
            }}
          />
        </div>

        {/* Center Sparkle or Health Metric icon */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white drop-shadow-md">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse opacity-95" aria-hidden="true" />
          <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase mt-0.5">
            {savingsRate.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Status Pill */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.borderColor} ${config.bgColor} ${config.textColor}`}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{config.label} Financial Health</span>
        </motion.div>
      )}
    </div>
  );
}

export const BalanceOrb = React.memo(BalanceOrbBase);

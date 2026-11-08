"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";

export function DashboardSkeleton() {
  return (
    <div className="dx-root relative isolate space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard data">
      {/* Header Skeleton */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded bg-[var(--surface-hover)]" />
          <div className="h-9 w-64 rounded-lg bg-[var(--surface-hover)]" />
          <div className="h-4 w-80 rounded bg-[var(--surface-hover)]" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 rounded-full bg-[var(--surface-hover)]" />
          <div className="h-9 w-28 rounded-full bg-[var(--surface-hover)]" />
          <div className="h-9 w-24 rounded-full bg-[var(--surface-hover)]" />
        </div>
      </header>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
        {/* Balance Hero Card */}
        <div className="sm:col-span-2 lg:col-span-8">
          <GlassCard className="h-full p-6">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-3">
                <div className="h-4 w-28 rounded bg-[var(--surface-hover)]" />
                <div className="h-14 w-64 rounded-xl bg-[var(--surface-hover)]" />
                <div className="flex items-center gap-3">
                  <div className="h-6 w-32 rounded-full bg-[var(--surface-hover)]" />
                  <div className="h-4 w-40 rounded bg-[var(--surface-hover)]" />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-36 h-36 rounded-full bg-[var(--surface-hover)]/70 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[var(--bg-base)]" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border)] grid gap-5 md:grid-cols-[1fr_1.6fr]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-[var(--surface-hover)]" />
                  <div className="h-6 w-24 rounded bg-[var(--surface-hover)]" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-[var(--surface-hover)]" />
                  <div className="h-6 w-24 rounded bg-[var(--surface-hover)]" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-[var(--surface-hover)]" />
                  <div className="h-4 w-32 rounded bg-[var(--surface-hover)]" />
                </div>
                <div className="h-3.5 w-full rounded-full bg-[var(--surface-hover)]" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Health & Insights Card */}
        <div className="sm:col-span-2 lg:col-span-4">
          <GlassCard className="h-full p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[var(--surface-hover)]/80 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-base)]" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 rounded bg-[var(--surface-hover)]" />
                <div className="h-5 w-20 rounded bg-[var(--surface-hover)]" />
                <div className="h-3 w-36 rounded bg-[var(--surface-hover)]" />
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-4 space-y-3">
              <div className="h-4 w-32 rounded bg-[var(--surface-hover)]" />
              <div className="h-10 w-full rounded-lg bg-[var(--surface-hover)]/60" />
              <div className="h-10 w-full rounded-lg bg-[var(--surface-hover)]/60" />
            </div>
          </GlassCard>
        </div>

        {/* 3 KPI Cards */}
        <div className="lg:col-span-4">
          <GlassCard className="h-32 p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-28 rounded bg-[var(--surface-hover)]" />
              <div className="h-7 w-7 rounded-lg bg-[var(--surface-hover)]" />
            </div>
            <div className="h-8 w-36 rounded bg-[var(--surface-hover)]" />
            <div className="h-3 w-24 rounded bg-[var(--surface-hover)]" />
          </GlassCard>
        </div>
        <div className="lg:col-span-4">
          <GlassCard className="h-32 p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-28 rounded bg-[var(--surface-hover)]" />
              <div className="h-7 w-7 rounded-lg bg-[var(--surface-hover)]" />
            </div>
            <div className="h-8 w-36 rounded bg-[var(--surface-hover)]" />
            <div className="h-3 w-24 rounded bg-[var(--surface-hover)]" />
          </GlassCard>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <GlassCard className="h-32 p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-28 rounded bg-[var(--surface-hover)]" />
              <div className="h-7 w-7 rounded-lg bg-[var(--surface-hover)]" />
            </div>
            <div className="h-8 w-36 rounded bg-[var(--surface-hover)]" />
            <div className="h-3 w-24 rounded bg-[var(--surface-hover)]" />
          </GlassCard>
        </div>

        {/* Cash Flow Chart Skeleton */}
        <div className="sm:col-span-2 lg:col-span-8">
          <GlassCard className="h-[380px] p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-5 w-40 rounded bg-[var(--surface-hover)]" />
              <div className="h-8 w-32 rounded-lg bg-[var(--surface-hover)]" />
            </div>
            <div className="h-48 w-full rounded-xl bg-[var(--surface-hover)]/40 flex items-center justify-center">
              <div className="h-32 w-11/12 rounded bg-[var(--surface-hover)]/30" />
            </div>
            <div className="flex justify-around">
              <div className="h-3 w-8 rounded bg-[var(--surface-hover)]" />
              <div className="h-3 w-8 rounded bg-[var(--surface-hover)]" />
              <div className="h-3 w-8 rounded bg-[var(--surface-hover)]" />
              <div className="h-3 w-8 rounded bg-[var(--surface-hover)]" />
              <div className="h-3 w-8 rounded bg-[var(--surface-hover)]" />
            </div>
          </GlassCard>
        </div>

        {/* Category Donut Skeleton */}
        <div className="sm:col-span-2 lg:col-span-4">
          <GlassCard className="h-[380px] p-6 flex flex-col items-center justify-between">
            <div className="w-full h-5 rounded bg-[var(--surface-hover)]" />
            <div className="w-44 h-44 rounded-full bg-[var(--surface-hover)]/60 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-[var(--bg-base)]" />
            </div>
            <div className="w-full space-y-2">
              <div className="h-3 w-full rounded bg-[var(--surface-hover)]" />
              <div className="h-3 w-3/4 rounded bg-[var(--surface-hover)]" />
            </div>
          </GlassCard>
        </div>

        {/* Recent Transactions Skeleton */}
        <div className="sm:col-span-2 lg:col-span-7">
          <GlassCard className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 w-44 rounded bg-[var(--surface-hover)]" />
              <div className="h-4 w-16 rounded bg-[var(--surface-hover)]" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-hover)]" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 rounded bg-[var(--surface-hover)]" />
                      <div className="h-3 w-20 rounded bg-[var(--surface-hover)]" />
                    </div>
                  </div>
                  <div className="h-5 w-20 rounded bg-[var(--surface-hover)]" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Budgets Skeleton */}
        <div className="sm:col-span-2 lg:col-span-5">
          <GlassCard className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 w-36 rounded bg-[var(--surface-hover)]" />
              <div className="h-4 w-16 rounded bg-[var(--surface-hover)]" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-28 rounded bg-[var(--surface-hover)]" />
                    <div className="h-4 w-24 rounded bg-[var(--surface-hover)]" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--surface-hover)]" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}


import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 w-full animate-pulse select-none">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl bg-[var(--surface-hover)]" />
          <div className="h-4 w-72 rounded-lg bg-[var(--surface)]" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-[var(--surface-hover)]" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Hero Card */}
        <div className="lg:col-span-5 lg:row-span-2 h-[340px] rounded-card bg-[var(--surface)] border border-[var(--border)] p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-md bg-[var(--surface-hover)]" />
            <div className="h-10 w-44 rounded-lg bg-[var(--surface-hover)]" />
          </div>
          <div className="w-28 h-28 rounded-full bg-[var(--surface-hover)] mx-auto my-4" />
          <div className="h-4 w-full rounded-md bg-[var(--surface-hover)]" />
        </div>

        {/* Stat Cards */}
        <div className="lg:col-span-3 h-[155px] rounded-card bg-[var(--surface)] border border-[var(--border)] p-6 space-y-3">
          <div className="h-4 w-24 rounded-md bg-[var(--surface-hover)]" />
          <div className="h-8 w-32 rounded-lg bg-[var(--surface-hover)]" />
        </div>
        <div className="lg:col-span-4 h-[155px] rounded-card bg-[var(--surface)] border border-[var(--border)] p-6 space-y-3">
          <div className="h-4 w-28 rounded-md bg-[var(--surface-hover)]" />
          <div className="h-8 w-36 rounded-lg bg-[var(--surface-hover)]" />
        </div>

        {/* Ring Card */}
        <div className="lg:col-span-7 h-[160px] rounded-card bg-[var(--surface)] border border-[var(--border)] p-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded-md bg-[var(--surface-hover)]" />
            <div className="h-6 w-32 rounded-lg bg-[var(--surface-hover)]" />
          </div>
          <div className="w-20 h-20 rounded-full bg-[var(--surface-hover)]" />
        </div>

        {/* Big Charts */}
        <div className="lg:col-span-8 h-[320px] rounded-card bg-[var(--surface)] border border-[var(--border)] p-6 flex flex-col justify-between">
          <div className="h-4 w-40 rounded-md bg-[var(--surface-hover)]" />
          <div className="h-48 w-full rounded-xl bg-[var(--surface-hover)]/60" />
        </div>
        <div className="lg:col-span-4 h-[320px] rounded-card bg-[var(--surface)] border border-[var(--border)] p-6 flex flex-col justify-between">
          <div className="h-4 w-36 rounded-md bg-[var(--surface-hover)]" />
          <div className="w-36 h-36 rounded-full bg-[var(--surface-hover)]/60 mx-auto" />
        </div>
      </div>
    </div>
  );
}


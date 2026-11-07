"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-full bg-[var(--danger)]/15 border border-[var(--danger)]/30 flex items-center justify-center text-[var(--danger)] mb-4 shadow-glow-coral">
        <AlertCircle className="w-7 h-7" aria-hidden="true" />
      </div>

      <h2 className="text-xl font-bold font-heading text-[var(--text-heading)]">
        Something went wrong
      </h2>
      <p className="text-xs text-[var(--text-muted)] max-w-md mt-2 mb-6">
        An error occurred while loading this view. You can safely retry or return to the dashboard.
      </p>

      <button
        onClick={() => reset()}
        className="btn-primary-glow px-5 py-2.5 text-xs font-semibold flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        <span>Try Again</span>
      </button>
    </div>
  );
}


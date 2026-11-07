"use client";

import React from "react";

export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none"
    >
      {/* Blob 1: Electric Violet - primary glow */}
      <div
        className="absolute -top-36 -left-36 w-[340px] sm:w-[620px] h-[340px] sm:h-[620px] rounded-full blur-[60px] sm:blur-[130px] opacity-40 mix-blend-screen animate-blob"
        style={{
          background: "radial-gradient(circle, var(--primary) 0%, rgba(124, 92, 255, 0.16) 70%, transparent 100%)",
        }}
      />

      {/* Blob 2: Cyan Aqua - accent glow */}
      <div
        className="absolute top-1/4 -right-36 w-[320px] sm:w-[580px] h-[320px] sm:h-[580px] rounded-full blur-[60px] sm:blur-[140px] opacity-35 mix-blend-screen animate-blob-slow"
        style={{
          background: "radial-gradient(circle, var(--accent-cyan) 0%, rgba(56, 213, 255, 0.16) 70%, transparent 100%)",
        }}
      />

      {/* Blob 3: Coral Magenta - Hidden on mobile (<640px) to maximize mobile GPU performance */}
      <div
        className="hidden sm:block absolute -bottom-36 left-1/3 w-[650px] h-[650px] rounded-full blur-[140px] opacity-30 mix-blend-screen animate-blob"
        style={{
          background: "radial-gradient(circle, var(--expense) 0%, rgba(255, 92, 138, 0.16) 70%, transparent 100%)",
        }}
      />

      {/* Subtle Noise / Grain Overlay */}
      <div className="noise-overlay" />
    </div>
  );
}

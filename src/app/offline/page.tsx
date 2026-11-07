import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — Aurora Ledger",
};

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#070A1A",
        color: "#F5F7FF",
        textAlign: "center",
        padding: "24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Aurora blob — violet */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,92,255,0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      {/* Aurora blob — cyan */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,213,255,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "24px",
          background:
            "linear-gradient(135deg, rgba(124,92,255,0.2), rgba(56,213,255,0.1))",
          border: "1px solid rgba(124,92,255,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "0 0 40px -10px rgba(124,92,255,0.5)",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A78BFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="#A78BFF" />
        </svg>
      </div>

      <h1
        style={{
          fontSize: "clamp(28px, 6vw, 40px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          marginBottom: "12px",
          lineHeight: 1.1,
          background: "linear-gradient(135deg, #F5F7FF 0%, #38D5FF 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        You&apos;re offline
      </h1>

      <p
        style={{
          color: "#A5ADD6",
          fontSize: "16px",
          lineHeight: 1.6,
          maxWidth: "340px",
          marginBottom: "32px",
        }}
      >
        Aurora Ledger needs a connection to sync your financial data. Your
        cached pages are still available.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          maxWidth: "280px",
          alignItems: "center",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50px",
            width: "100%",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #7C5CFF, #38D5FF)",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "15px",
            textDecoration: "none",
            boxShadow: "0 4px 24px rgba(124, 92, 255, 0.45)",
          }}
        >
          Try again
        </Link>
        <p style={{ fontSize: "12px", color: "#555A85" }}>
          Aurora Ledger · Personal Finance
        </p>
      </div>
    </div>
  );
}

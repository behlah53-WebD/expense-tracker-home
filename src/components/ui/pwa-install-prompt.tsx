"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Download, Share, Plus } from "lucide-react";

type Platform = "android" | "ios" | "other";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

const DISMISSED_KEY = "aurora-pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isStandalone()) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    const p = detectPlatform();
    setPlatform(p);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (p === "android") setShowAndroid(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show instruction sheet after a short delay if not standalone
    if (p === "ios") {
      const timer = setTimeout(() => setShowIOS(true), 3000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShowAndroid(false);
    setShowIOS(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
      setShowAndroid(false);
      localStorage.setItem(DISMISSED_KEY, "1");
    }
  }, [deferredPrompt]);

  if (!mounted || isStandalone()) return null;

  // Android / Chrome install card
  if (showAndroid) {
    return (
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Install Aurora Ledger"
        className="fixed bottom-[calc(90px+env(safe-area-inset-bottom,0px))] left-4 right-4 z-50 max-w-sm mx-auto md:left-auto md:right-6 md:bottom-6"
      >
        <div className="glass-card p-4 border border-[var(--primary)]/40 bg-[var(--bg-elevated)] shadow-[0_8px_32px_-8px_rgba(124,92,255,0.5)]">
          <button
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="absolute top-3 right-3 w-8 h-8 rounded-full grid place-items-center text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent-cyan)] flex items-center justify-center shrink-0 shadow-[0_0_20px_-4px_var(--primary)]">
              <span className="text-white text-xl">✦</span>
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-sm text-[var(--text-heading)]">
                Install Aurora Ledger
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Add to your home screen for the full native experience — works offline too.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={dismiss}
              className="flex-1 h-10 rounded-xl text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] hover:bg-white/5 transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--accent-cyan)] shadow-[0_4px_16px_-4px_var(--primary)] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS "Add to Home Screen" instruction sheet
  if (showIOS) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add to Home Screen instructions"
        className="fixed inset-0 z-50 flex items-end justify-center p-4"
        onClick={dismiss}
      >
        <div
          className="glass-card w-full max-w-sm p-5 border border-[var(--primary)]/30 bg-[var(--bg-elevated)] mb-[calc(70px+env(safe-area-inset-bottom,0px))]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-4" />

          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-4 right-4 w-8 h-8 rounded-full grid place-items-center text-[var(--text-muted)]"
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="font-heading font-bold text-base text-[var(--text-heading)] mb-1">
            Add Aurora Ledger to your Home Screen
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed">
            Get the full app experience with offline access and instant loading.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <Share className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-heading)]">
                  1. Tap the Share button
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  At the bottom of Safari&apos;s browser bar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-heading)]">
                  2. Tap &quot;Add to Home Screen&quot;
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Scroll down in the share sheet to find it
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={dismiss}
            className="mt-4 w-full h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--accent-cyan)] shadow-[0_4px_16px_-4px_var(--primary)]"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return null;
}

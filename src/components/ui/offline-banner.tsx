"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOffline = () => setIsOnline(false);
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!mounted) return null;

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-white bg-[var(--expense)] shadow-lg"
        style={{ paddingTop: "calc(8px + env(safe-area-inset-top, 0px))" }}
      >
        <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
        <span>You&apos;re offline — showing cached data</span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-[#06251B] bg-[var(--income)] shadow-lg"
        style={{ paddingTop: "calc(8px + env(safe-area-inset-top, 0px))" }}
      >
        <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Back online!</span>
      </div>
    );
  }

  return null;
}

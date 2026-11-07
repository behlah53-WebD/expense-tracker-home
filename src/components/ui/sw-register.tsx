"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Check for updates every 60s when the app is in focus
        const intervalId = setInterval(() => reg.update(), 60_000);
        window.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") reg.update();
        });
        return () => clearInterval(intervalId);
      })
      .catch((err) => {
        // Don't crash the app if SW registration fails
        console.warn("SW registration failed:", err);
      });
  }, []);

  return null;
}

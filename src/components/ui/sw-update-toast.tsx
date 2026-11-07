"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";

export function SWUpdateToast() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SW_UPDATED") {
        toast.info("New version available!", {
          description: "A new update is ready. Refresh to get the latest features.",
          duration: Infinity,
          action: {
            label: "Update",
            onClick: () => {
              navigator.serviceWorker.getRegistration().then((reg) => {
                if (reg?.waiting) {
                  reg.waiting.postMessage({ type: "SKIP_WAITING" });
                  window.location.reload();
                } else {
                  window.location.reload();
                }
              });
            },
          },
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

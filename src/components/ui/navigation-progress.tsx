"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When route changes, complete the bar
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Listen for link clicks to provide instant visual response
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (
        target &&
        target.href &&
        target.href.startsWith(window.location.origin) &&
        !target.href.includes("#") &&
        target.target !== "_blank" &&
        target.href !== window.location.href
      ) {
        setLoading(true);
        setProgress(35);
        setTimeout(() => setProgress(75), 150);
      }
    };

    window.addEventListener("click", handleLinkClick);
    return () => window.removeEventListener("click", handleLinkClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-[var(--primary)] via-[var(--accent-cyan)] to-[var(--income)] shadow-glow-violet transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px var(--primary-glow), 0 0 5px var(--accent-cyan)",
        }}
      />
    </div>
  );
}


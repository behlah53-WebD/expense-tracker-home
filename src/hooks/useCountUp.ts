"use client";

import { useEffect, useState } from "react";

export function useCountUp(
  targetValue: number,
  duration: number = 800,
  decimals: number = 2
): number {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    // Check for prefers-reduced-motion
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setDisplayValue(targetValue);
        return;
      }
    }

    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const change = targetValue - startValue;

    if (change === 0) {
      setDisplayValue(targetValue);
      return;
    }

    let animationFrameId: number;

    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = startValue + change * easedProgress;
      const multiplier = Math.pow(10, decimals);
      setDisplayValue(Math.round(current * multiplier) / multiplier);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetValue, duration, decimals]);

  return displayValue;
}


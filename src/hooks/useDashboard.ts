"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const CACHE_KEY = "aurora_dashboard_cache_v1";
const CACHE_TIME_KEY = "aurora_dashboard_cache_time_v1";
const STALE_TIME_MS = 30_000; // 30 seconds before considering cached data stale

export interface DashboardData {
  summary: {
    totalBalance: number;
    currentMonth: {
      income: number;
      expense: number;
      netSavings: number;
      savingsRate: number;
    };
    lastMonth: {
      income: number;
      expense: number;
      netSavings: number;
    };
    deltas: {
      income: number;
      expense: number;
      savings: number;
    };
    recentTransactions: any[];
  };
  monthlyTrend: {
    "12M": Array<{ label: string; monthKey: string; income: number; expense: number; net: number }>;
    "30D": Array<{ label: string; income: number; expense: number; net: number }>;
    "7D": Array<{ label: string; income: number; expense: number; net: number }>;
  };
  categoryBreakdown: {
    type: string;
    totalAmount: number;
    categories: Array<{
      categoryId: string;
      name: string;
      color: string;
      icon: string;
      amount: number;
      count: number;
      percentage: number;
    }>;
    insights: string[];
  };
  budgets: Array<{
    id: string;
    limit: number;
    month: number;
    year: number;
    userId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      color: string;
      icon: string;
      type?: string;
    } | null;
    spent: number;
    remaining: number;
    percentage: number;
    rawPercentage: number;
    isWarning: boolean;
    isExceeded: boolean;
  }>;
  timing?: {
    authMs: number;
    dbConnectMs: number;
    queryMs: number;
    totalMs: number;
  };
}

/**
 * Synchronously retrieves last known dashboard data from localStorage
 */
function getCachedData(): DashboardData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[DashboardCache] Failed to parse cached data:", err);
    return null;
  }
}

/**
 * Saves fresh dashboard data to localStorage
 */
function setCachedData(data: DashboardData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
  } catch (err) {
    console.warn("[DashboardCache] Failed to save data to localStorage:", err);
  }
}

/**
 * Prefetch dashboard data into browser cache
 */
export async function prefetchDashboard(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/dashboard", {
      headers: { credentials: "same-origin" },
    });
    if (res.ok) {
      const data: DashboardData = await res.json();
      setCachedData(data);
    }
  } catch {
    // Non-blocking prefetch failure
  }
}

/**
 * Hook providing instant 0 ms initial render from localStorage,
 * silent background revalidation, and mutation-triggered refetches.
 */
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(() => getCachedData());
  const [isLoading, setIsLoading] = useState<boolean>(() => !data);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);

  const fetchFreshData = useCallback(async (isSilent = true) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetching(true);
    if (!isSilent) setIsLoading(true);

    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error(`Dashboard request failed: ${res.status}`);
      }
      const freshData: DashboardData = await res.json();
      setData(freshData);
      setCachedData(freshData);
      lastFetchTimeRef.current = Date.now();
      setError(null);
    } catch (err: any) {
      console.error("[useDashboard] fetch error:", err);
      setError(err?.message || "Failed to load dashboard");
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    const cachedTime = Number(localStorage.getItem(CACHE_TIME_KEY) || 0);
    const isStale = Date.now() - cachedTime > STALE_TIME_MS;

    // If no data or data is stale, fetch fresh
    if (!data || isStale) {
      fetchFreshData(!data ? false : true);
    }

    // Refetch on window focus if stale
    const handleFocus = () => {
      if (Date.now() - lastFetchTimeRef.current > STALE_TIME_MS) {
        fetchFreshData(true);
      }
    };

    // Refetch on mutation events (e.g., after adding transaction)
    const handleMutation = () => {
      fetchFreshData(true);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("aurora:mutation", handleMutation);
    window.addEventListener("storage", handleMutation);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("aurora:mutation", handleMutation);
      window.removeEventListener("storage", handleMutation);
    };
  }, [fetchFreshData, data]);

  const refetch = useCallback(() => {
    return fetchFreshData(false);
  }, [fetchFreshData]);

  return {
    data,
    isLoading: isLoading && !data, // Only loading if NO cached data is available
    isFetching,
    error,
    refetch,
  };
}


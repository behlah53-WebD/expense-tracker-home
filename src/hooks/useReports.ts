"use client";

import {
  useGetSummaryQuery,
  useGetMonthlyTrendQuery,
  useGetCategoryBreakdownQuery,
  SummaryData,
  MonthlyTrendData,
  CategoryBreakdownData,
} from "@/lib/store/api/baseApi";
import { TransactionWithCategory } from "./useTransactions";

export type { SummaryData, MonthlyTrendData, CategoryBreakdownData, TransactionWithCategory };

export function useSummary() {
  const { data, isLoading, isFetching, error, refetch } = useGetSummaryQuery();
  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

export function useMonthlyTrend() {
  const { data, isLoading, isFetching, error, refetch } = useGetMonthlyTrendQuery();
  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

export function useCategoryBreakdown(params?: {
  type?: "EXPENSE" | "INCOME";
  from?: string;
  to?: string;
}) {
  const { data, isLoading, isFetching, error, refetch } = useGetCategoryBreakdownQuery(params);
  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

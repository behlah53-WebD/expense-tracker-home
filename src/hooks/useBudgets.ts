"use client";

import {
  useGetBudgetsQuery,
  useSaveBudgetMutation,
  useDeleteBudgetMutation,
  BudgetItem,
  BudgetsResponse,
} from "@/lib/store/api/baseApi";
import { toast } from "sonner";
import { BudgetInput } from "@/lib/validators";

export type { BudgetItem, BudgetsResponse };

export function useBudgets(month?: number, year?: number) {
  const { data, isLoading, isFetching, error, refetch } = useGetBudgetsQuery(
    month || year ? { month, year } : undefined
  );
  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

export function useSaveBudget() {
  const [saveBudget, { isLoading }] = useSaveBudgetMutation();

  const mutateAsync = async (data: BudgetInput) => {
    try {
      const res = await saveBudget(data).unwrap();
      toast.success("Budget saved!");
      return res;
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to save budget");
      throw err;
    }
  };

  const mutate = (data: BudgetInput) => {
    mutateAsync(data).catch(() => {});
  };

  return { mutate, mutateAsync, isPending: isLoading, isLoading };
}

export function useDeleteBudget() {
  const [deleteBudget, { isLoading }] = useDeleteBudgetMutation();

  const mutateAsync = async (id: string) => {
    try {
      const res = await deleteBudget(id).unwrap();
      toast.success("Budget removed");
      return res;
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to delete budget");
      throw err;
    }
  };

  const mutate = (id: string) => {
    mutateAsync(id).catch(() => {});
  };

  return { mutate, mutateAsync, isPending: isLoading, isLoading };
}

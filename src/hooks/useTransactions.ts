"use client";

import {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  TransactionWithCategory,
  TransactionsResponse,
} from "@/lib/store/api/baseApi";
import { toast } from "sonner";
import { TransactionInput } from "@/lib/validators";

export type { TransactionWithCategory, TransactionsResponse };

export function useTransactions(params: {
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  const { data, isLoading, isFetching, error, refetch } = useGetTransactionsQuery(params);
  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

export function useCreateTransaction() {
  const [createTx, { isLoading }] = useCreateTransactionMutation();

  const mutateAsync = async (data: TransactionInput) => {
    try {
      const res = await createTx(data).unwrap();
      toast.success(
        `${res.type === "INCOME" ? "Income" : "Expense"} of ₹${res.amount.toLocaleString("en-IN")} recorded!`
      );
      return res;
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to add transaction");
      throw err;
    }
  };

  const mutate = (data: TransactionInput) => {
    mutateAsync(data).catch(() => {});
  };

  return { mutate, mutateAsync, isPending: isLoading, isLoading };
}

export function useUpdateTransaction() {
  const [updateTx, { isLoading }] = useUpdateTransactionMutation();

  const mutateAsync = async ({ id, data }: { id: string; data: TransactionInput }) => {
    try {
      const res = await updateTx({ id, data }).unwrap();
      toast.success("Transaction updated successfully!");
      return res;
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to update transaction");
      throw err;
    }
  };

  const mutate = (arg: { id: string; data: TransactionInput }) => {
    mutateAsync(arg).catch(() => {});
  };

  return { mutate, mutateAsync, isPending: isLoading, isLoading };
}

export function useDeleteTransaction() {
  const [deleteTx, { isLoading }] = useDeleteTransactionMutation();

  const mutateAsync = async (id: string) => {
    try {
      const res = await deleteTx(id).unwrap();
      toast.success("Transaction deleted");
      return res;
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to delete transaction");
      throw err;
    }
  };

  const mutate = (id: string) => {
    mutateAsync(id).catch(() => {});
  };

  return { mutate, mutateAsync, isPending: isLoading, isLoading };
}

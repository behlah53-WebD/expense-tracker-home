"use client";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  CategoryItem,
} from "@/lib/store/api/baseApi";
import { toast } from "sonner";
import { CategoryInput } from "@/lib/validators";

export type { CategoryItem };

export function useCategories(type?: "INCOME" | "EXPENSE", options?: { skip?: boolean }) {
  const { data = [], isLoading, isFetching, error, refetch } = useGetCategoriesQuery(type, {
    skip: options?.skip,
  });
  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

export function useCreateCategory() {
  const [createCat, { isLoading }] = useCreateCategoryMutation();

  const mutateAsync = async (data: CategoryInput) => {
    try {
      const res = await createCat(data).unwrap();
      toast.success("Category created!");
      return res;
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to create category");
      throw err;
    }
  };

  const mutate = (data: CategoryInput) => {
    mutateAsync(data).catch(() => {});
  };

  return { mutate, mutateAsync, isPending: isLoading, isLoading };
}

export function useUpdateCategory() {
  const [updateCat, { isLoading }] = useUpdateCategoryMutation();

  const mutateAsync = async ({ id, data }: { id: string; data: CategoryInput }) => {
    try {
      const res = await updateCat({ id, data }).unwrap();
      toast.success("Category updated!");
      return res;
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to update category");
      throw err;
    }
  };

  const mutate = (arg: { id: string; data: CategoryInput }) => {
    mutateAsync(arg).catch(() => {});
  };

  return { mutate, mutateAsync, isPending: isLoading, isLoading };
}

export function useDeleteCategory() {
  const [deleteCat, { isLoading }] = useDeleteCategoryMutation();

  const mutateAsync = async (id: string) => {
    try {
      const res = await deleteCat(id).unwrap();
      toast.success("Category deleted");
      return res;
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to delete category");
      throw err;
    }
  };

  const mutate = (id: string) => {
    mutateAsync(id).catch(() => {});
  };

  return { mutate, mutateAsync, isPending: isLoading, isLoading };
}

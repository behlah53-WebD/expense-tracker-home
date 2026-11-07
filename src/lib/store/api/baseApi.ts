import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TransactionInput, CategoryInput, BudgetInput, ProfileUpdateInput, ChangePasswordInput } from "@/lib/validators";

export interface TransactionWithCategory {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note?: string | null;
  date: string;
  recurring: boolean;
  categoryId: string;
  userId: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: string;
  };
}

export interface TransactionsResponse {
  transactions: TransactionWithCategory[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface SummaryData {
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
  recentTransactions: TransactionWithCategory[];
}

export interface MonthlyChartPoint {
  label: string;
  monthKey?: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyTrendData {
  "12M": MonthlyChartPoint[];
  "30D": MonthlyChartPoint[];
  "7D": MonthlyChartPoint[];
}

export interface CategoryBreakdownData {
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
  top5Transactions: TransactionWithCategory[];
  biggestCategory: string;
  insights: string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
  _count?: {
    transactions: number;
  };
}

export interface BudgetItem {
  id: string;
  limit: number;
  month: number;
  year: number;
  categoryId: string;
  spent: number;
  remaining: number;
  percentage: number;
  rawPercentage: number;
  isWarning: boolean;
  isExceeded: boolean;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

export interface BudgetsResponse {
  month: number;
  year: number;
  budgets: BudgetItem[];
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      // Content-type default
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  }),
  tagTypes: [
    "Transactions",
    "Categories",
    "Budgets",
    "Summary",
    "MonthlyTrend",
    "CategoryBreakdown",
    "UserProfile",
  ],
  keepUnusedDataFor: 300, // Cache server responses for 5 minutes
  refetchOnMountOrArgChange: 30, // Refetch only if 30s have passed since last mount
  endpoints: (builder) => ({
    // Reports Endpoints
    getSummary: builder.query<SummaryData, void>({
      query: () => "/reports/summary",
      providesTags: ["Summary"],
    }),

    getMonthlyTrend: builder.query<MonthlyTrendData, void>({
      query: () => "/reports/monthly",
      providesTags: ["MonthlyTrend"],
    }),

    getCategoryBreakdown: builder.query<
      CategoryBreakdownData,
      { type?: "EXPENSE" | "INCOME"; from?: string; to?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.set("type", params.type);
        if (params?.from) queryParams.set("from", params.from);
        if (params?.to) queryParams.set("to", params.to);
        const q = queryParams.toString();
        return `/reports/categories${q ? `?${q}` : ""}`;
      },
      providesTags: (result, error, arg) => [
        { type: "CategoryBreakdown", id: arg?.type || "ALL" },
      ],
    }),

    // Transactions Endpoints
    getTransactions: builder.query<
      TransactionsResponse,
      {
        type?: "INCOME" | "EXPENSE";
        categoryId?: string;
        from?: string;
        to?: string;
        q?: string;
        page?: number;
        limit?: number;
        sort?: string;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.set("type", params.type);
        if (params.categoryId && params.categoryId !== "ALL")
          queryParams.set("categoryId", params.categoryId);
        if (params.from) queryParams.set("from", params.from);
        if (params.to) queryParams.set("to", params.to);
        if (params.q) queryParams.set("q", params.q);
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.sort) queryParams.set("sort", params.sort);
        return `/transactions?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.transactions
          ? [
              ...result.transactions.map(({ id }) => ({
                type: "Transactions" as const,
                id,
              })),
              { type: "Transactions" as const, id: "LIST" },
            ]
          : [{ type: "Transactions" as const, id: "LIST" }],
    }),

    createTransaction: builder.mutation<TransactionWithCategory, TransactionInput>({
      query: (data) => ({
        url: "/transactions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Transactions", id: "LIST" },
        "Summary",
        "MonthlyTrend",
        "CategoryBreakdown",
        "Budgets",
      ],
    }),

    updateTransaction: builder.mutation<
      TransactionWithCategory,
      { id: string; data: TransactionInput }
    >({
      query: ({ id, data }) => ({
        url: `/transactions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Transactions", id },
        { type: "Transactions", id: "LIST" },
        "Summary",
        "MonthlyTrend",
        "CategoryBreakdown",
        "Budgets",
      ],
    }),

    deleteTransaction: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Transactions", id },
        { type: "Transactions", id: "LIST" },
        "Summary",
        "MonthlyTrend",
        "CategoryBreakdown",
        "Budgets",
      ],
    }),

    // Categories Endpoints
    getCategories: builder.query<CategoryItem[], "INCOME" | "EXPENSE" | void>({
      query: (type) => (type ? `/categories?type=${type}` : "/categories"),
      providesTags: ["Categories"],
    }),

    createCategory: builder.mutation<CategoryItem, CategoryInput>({
      query: (data) => ({
        url: "/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation<CategoryItem, { id: string; data: CategoryInput }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Categories", { type: "Transactions", id: "LIST" }],
    }),

    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories", { type: "Transactions", id: "LIST" }],
    }),

    // Budgets Endpoints
    getBudgets: builder.query<BudgetsResponse, { month?: number; year?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.month) queryParams.set("month", params.month.toString());
        if (params?.year) queryParams.set("year", params.year.toString());
        const q = queryParams.toString();
        return `/budgets${q ? `?${q}` : ""}`;
      },
      providesTags: ["Budgets"],
    }),

    saveBudget: builder.mutation<BudgetItem, BudgetInput>({
      query: (data) => ({
        url: "/budgets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Budgets"],
    }),

    deleteBudget: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/budgets?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Budgets"],
    }),

    // User Profile & Settings Endpoints
    updateProfile: builder.mutation<
      { id: string; name: string; email: string; currency: string },
      ProfileUpdateInput
    >({
      query: (data) => ({
        url: "/user/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserProfile", "Summary"],
    }),

    changePassword: builder.mutation<{ message: string }, ChangePasswordInput>({
      query: (data) => ({
        url: "/user/password",
        method: "PUT",
        body: data,
      }),
    }),

    deleteAccount: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/user/delete",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetSummaryQuery,
  useGetMonthlyTrendQuery,
  useGetCategoryBreakdownQuery,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetBudgetsQuery,
  useSaveBudgetMutation,
  useDeleteBudgetMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  usePrefetch,
} = baseApi;


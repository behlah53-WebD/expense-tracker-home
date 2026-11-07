import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
  note: z.string().max(255, "Note must be less than 255 characters").optional().nullable(),
  recurring: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Valid hex color required"),
  icon: z.string().min(1, "Icon is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  limit: z.coerce.number().positive("Limit must be greater than 0"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const transactionFilterSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(["date-desc", "date-asc", "amount-desc", "amount-asc"]).default("date-desc"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;


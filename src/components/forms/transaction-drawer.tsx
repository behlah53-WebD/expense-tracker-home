"use client";

import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, FileText, Repeat, Check, Loader2 } from "lucide-react";
import { transactionSchema, TransactionInput } from "@/lib/validators";
import { useCategories } from "@/hooks/useCategories";
import { useCreateTransaction, useUpdateTransaction, TransactionWithCategory } from "@/hooks/useTransactions";
import { CategoryIcon } from "@/components/ui/category-icon";

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: TransactionWithCategory | null;
  defaultType?: "INCOME" | "EXPENSE";
}

export function TransactionDrawer({
  isOpen,
  onClose,
  transactionToEdit,
  defaultType = "EXPENSE",
}: TransactionDrawerProps) {
  const isEditing = !!transactionToEdit;
  const drawerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      amount: undefined,
      categoryId: "",
      date: new Date(),
      note: "",
      recurring: false,
    },
  });

  const selectedType = watch("type");
  const selectedCategoryId = watch("categoryId");
  const recurring = watch("recurring");

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories(selectedType, {
    skip: !isOpen,
  });
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();

  // Populate form if editing
  useEffect(() => {
    if (transactionToEdit) {
      reset({
        type: transactionToEdit.type,
        amount: transactionToEdit.amount,
        categoryId: transactionToEdit.categoryId,
        date: new Date(transactionToEdit.date),
        note: transactionToEdit.note || "",
        recurring: transactionToEdit.recurring,
      });
    } else {
      reset({
        type: defaultType,
        amount: undefined,
        categoryId: "",
        date: new Date(),
        note: "",
        recurring: false,
      });
    }
  }, [transactionToEdit, defaultType, reset, isOpen]);

  // Set first category automatically when categories load and none is selected
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setValue("categoryId", categories[0].id);
    }
  }, [categories, selectedCategoryId, setValue]);

  const onSubmit = async (data: TransactionInput) => {
    if (isEditing && transactionToEdit) {
      await updateTx.mutateAsync({ id: transactionToEdit.id, data });
    } else {
      await createTx.mutateAsync(data);
    }
    onClose();
  };

  // Close on ESC and focus handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          className="fixed inset-0 z-50 overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Responsive Drawer: Bottom sheet on mobile, slide-over 440px on desktop */}
          <motion.div
            ref={drawerRef}
            initial={{ y: "100%", x: 0 }}
            animate={{
              y: 0,
              x: 0,
              transition: { type: "spring", damping: 28, stiffness: 240 },
            }}
            exit={{
              y: "100%",
              transition: { duration: 0.2 },
            }}
            className="fixed bottom-0 left-0 right-0 h-[92dvh] max-h-[92dvh] rounded-t-[28px] md:h-screen md:max-h-screen md:top-0 md:bottom-0 md:left-auto md:right-0 md:w-[440px] md:max-w-[440px] md:rounded-t-none md:rounded-l-[24px] bg-[var(--bg-elevated)] border-t md:border-t-0 md:border-l border-[var(--border)] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Mobile Drag Handle */}
            <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-[var(--border)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
              <h2 id="drawer-title" className="font-heading font-bold text-lg text-[var(--text-heading)]">
                {isEditing ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Segmented Type Toggle (Coral / Mint) */}
                <div className="p-1 rounded-2xl bg-[var(--surface)] border border-[var(--border)] grid grid-cols-2 gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("type", "EXPENSE");
                      setValue("categoryId", "");
                    }}
                    className={`h-11 rounded-inner text-xs font-semibold transition-all duration-200 ${
                      selectedType === "EXPENSE"
                        ? "bg-gradient-to-r from-[var(--expense)] to-[var(--expense-deep)] text-white shadow-glow-coral"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("type", "INCOME");
                      setValue("categoryId", "");
                    }}
                    className={`h-11 rounded-inner text-xs font-semibold transition-all duration-200 ${
                      selectedType === "INCOME"
                        ? "bg-gradient-to-r from-[var(--income)] to-[var(--income-deep)] text-black font-bold shadow-glow-mint"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount Input */}
                <div className="text-center py-2">
                  <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)] block mb-1">
                    Amount
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`text-3xl font-mono font-bold ${
                        selectedType === "INCOME" ? "text-[var(--income-text)]" : "text-[var(--expense-text)]"
                      }`}
                    >
                      ₹
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      {...register("amount", { valueAsNumber: true })}
                      className="w-56 text-center font-mono text-4xl font-bold bg-transparent border-b-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none text-[var(--text-heading)] placeholder:text-[var(--text-muted)] transition-colors"
                      autoFocus
                    />
                  </div>
                  <div className="h-5 mt-1">
                    {errors.amount && (
                      <p className="text-xs text-[var(--danger)] font-medium">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category Chips Grid */}
                <div className="space-y-2">
                  <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)] block">
                    Category
                  </label>
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center py-6 text-xs text-[var(--text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading categories...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                      {categories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setValue("categoryId", cat.id)}
                            className={`h-9 px-3 rounded-full border text-left transition-all duration-150 flex items-center gap-2 text-xs font-medium ${
                              isSelected
                                ? "border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--text-heading)] shadow-glow-violet scale-[1.02]"
                                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-hover)]"
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                              aria-hidden="true"
                            />
                            <span className="truncate">{cat.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[var(--income-text)] ml-auto shrink-0" aria-hidden="true" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="h-4">
                    {errors.categoryId && (
                      <p className="text-xs text-[var(--danger)] font-medium">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date Input */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" /> Date
                  </label>
                  <input
                    type="date"
                    defaultValue={
                      transactionToEdit?.date
                        ? new Date(transactionToEdit.date).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                    onChange={(e) => setValue("date", new Date(e.target.value))}
                    className="glass-input w-full px-4 text-base md:text-sm"
                  />
                </div>

                {/* Note / Description */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Groceries at Market"
                    {...register("note")}
                    className="glass-input w-full px-4 text-base md:text-sm"
                  />
                </div>

                {/* Recurring Switch */}
                <div className="flex items-center justify-between p-3.5 rounded-inner glass-card">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-inner bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                      <Repeat className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-heading)]">
                        Monthly Recurring
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        Auto-bills or recurring income
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={recurring}
                    aria-label="Toggle recurring monthly transaction"
                    onClick={() => setValue("recurring", !recurring)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none ${
                      recurring ? "bg-[var(--primary)]" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        recurring ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sticky Submit Button Footer */}
              <div className="p-4 md:p-6 border-t border-[var(--border)] bg-[var(--bg-elevated)] shrink-0 pb-[calc(16px+env(safe-area-inset-bottom,0px))] md:pb-6">
                <button
                  type="submit"
                  disabled={isSubmitting || createTx.isPending || updateTx.isPending}
                  className="btn-primary-glow w-full h-12 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {(isSubmitting || createTx.isPending || updateTx.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  )}
                  <span>
                    {isEditing
                      ? "Save Changes"
                      : selectedType === "INCOME"
                      ? "Record Income"
                      : "Record Expense"}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { GlassCard } from "@/components/ui/glass-card";
import { CategoryIcon } from "@/components/ui/category-icon";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { useBudgets, useSaveBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { formatCurrency } from "@/lib/utils";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from "@/lib/store/api/baseApi";
import {
  Moon,
  Sun,
  Laptop,
  Globe,
  User,
  Lock,
  Tag,
  Target,
  Trash2,
  Plus,
  AlertTriangle,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme } = useTheme();

  // Profile Form State
  const [name, setName] = useState(session?.user?.name || "");
  const [currency, setCurrency] = useState(
    (session?.user as any)?.currency || "INR"
  );
  const [updateProfileMutation, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordMutation, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  // Category Creation State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("var(--primary)");
  const [newCatIcon, setNewCatIcon] = useState("Tag");
  const [newCatType, setNewCatType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  // Budget Creation State
  const [selectedBudgetCat, setSelectedBudgetCat] = useState("");
  const [budgetLimit, setBudgetLimit] = useState<number | "">("");

  // Delete Account Confirmation State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteAccountMutation, { isLoading: isDeletingAccount }] =
    useDeleteAccountMutation();

  const { data: categories = [] } = useCategories();
  const createCat = useCreateCategory();
  const deleteCat = useDeleteCategory();

  const { data: budgetData } = useBudgets();
  const saveBudget = useSaveBudget();
  const deleteBudget = useDeleteBudget();

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCatModalOpen) setIsCatModalOpen(false);
        if (isDeleteDialogOpen) setIsDeleteDialogOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCatModalOpen, isDeleteDialogOpen]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation({ name, currency }).unwrap();
      await updateSession({ name, currency });
      toast.success("Profile preferences saved successfully!");
    } catch (err: any) {
      toast.error(
        err?.data?.error || err?.message || "Failed to update profile"
      );
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      await changePasswordMutation({
        currentPassword,
        newPassword,
        confirmPassword,
      }).unwrap();
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(
        err?.data?.error || err?.message || "Failed to update password"
      );
    }
  };

  // Handle Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCat.mutateAsync({
        name: newCatName.trim(),
        color: newCatColor,
        icon: newCatIcon,
        type: newCatType,
      });
      setIsCatModalOpen(false);
      setNewCatName("");
    } catch {
      // toast is handled in hook
    }
  };

  // Handle Save Budget
  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetCat || !budgetLimit) return;
    const now = new Date();
    await saveBudget.mutateAsync({
      categoryId: selectedBudgetCat,
      limit: Number(budgetLimit),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
    setBudgetLimit("");
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation().unwrap();
      toast.success("Account deleted");
      signOut({ callbackUrl: "/register" });
    } catch (err: any) {
      toast.error(
        err?.data?.error || err?.message || "Account deletion failed"
      );
    }
  };

  const AVAILABLE_ICONS = [
    "Utensils",
    "Home",
    "Plane",
    "ShoppingBag",
    "Receipt",
    "HeartPulse",
    "Gamepad2",
    "GraduationCap",
    "Briefcase",
    "Laptop",
    "TrendingUp",
    "Gift",
    "Coins",
    "MoreHorizontal",
    "Coffee",
    "Car",
    "Tag",
  ];

  const COLOR_PALETTE = [
    "#FF8A5C",
    "#7C5CFF",
    "#38D5FF",
    "#FF5C8A",
    "#FFC857",
    "#2EF2B0",
    "#C77DFF",
    "#5C8AFF",
    "#10B981",
    "#FF4D6D",
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)]">
          Settings & Preferences
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Customize your Expense Tracker ledger experience, visual themes,
          categories, and security
        </p>
      </div>

      {/* 1. Theme & Localization */}
      <GlassCard className="space-y-6">
        <div>
          <h2 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[var(--primary)]" />
            Appearance & Currency
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Switch between dark midnight and pearl light themes, and set default
            currency format
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Dark Theme Button */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-[var(--radius-inner)] border text-left transition-all ${
              theme === "dark"
                ? "border-[var(--primary)] bg-[var(--primary)]/15 shadow-glow-violet"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <Moon className="w-5 h-5 text-[var(--aurora-cyan)]" />
              {theme === "dark" && <Check className="w-4 h-4 text-income" />}
            </div>
            <p className="font-semibold text-sm text-[var(--text-primary)] mt-3">
              Midnight Expense Tracker
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Deep dark canvas with glowing northern lights
            </p>
          </button>

          {/* Light Theme Button */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-4 rounded-[var(--radius-inner)] border text-left transition-all ${
              theme === "light"
                ? "border-[var(--primary)] bg-[var(--primary)]/15 shadow-glow-violet"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <Sun className="w-5 h-5 text-amber-400" />
              {theme === "light" && <Check className="w-4 h-4 text-income" />}
            </div>
            <p className="font-semibold text-sm text-[var(--text-primary)] mt-3">
              Pearl Expense Tracker
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              High-contrast iridescent light mode
            </p>
          </button>

          {/* System Theme Button */}
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`p-4 rounded-[var(--radius-inner)] border text-left transition-all ${
              theme === "system"
                ? "border-[var(--primary)] bg-[var(--primary)]/15 shadow-glow-violet"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <Laptop className="w-5 h-5 text-[var(--text-secondary)]" />
              {theme === "system" && <Check className="w-4 h-4 text-income" />}
            </div>
            <p className="font-semibold text-sm text-[var(--text-primary)] mt-3">
              System Sync
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Follow device OS display preference
            </p>
          </button>
        </div>

        {/* Currency Selector */}
        <div className="pt-4 border-t border-[var(--border)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] block">
              Default Currency Unit
            </label>
            <p className="text-[11px] text-[var(--text-muted)]">
              All financial values will format with this currency notation
            </p>
          </div>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="glass-input h-11 px-4 text-base sm:text-xs bg-[var(--bg-elevated)] min-w-[200px]"
          >
            <option value="INR">₹ INR (Indian Rupee)</option>
            <option value="USD">$ USD (US Dollar)</option>
            <option value="EUR">€ EUR (Euro)</option>
            <option value="GBP">£ GBP (British Pound)</option>
          </select>
        </div>
      </GlassCard>

      {/* 2. Profile Details */}
      <GlassCard className="space-y-4">
        <div>
          <h2 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--aurora-cyan)]" />
            Profile Details
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Update your display name and view account email
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="glass-input w-full h-11 sm:h-12 px-4 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Email Address (Permanent)
              </label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="glass-input w-full h-11 sm:h-12 px-4 text-base sm:text-sm opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn-primary-glow h-11 px-5 text-xs font-semibold flex items-center gap-2"
            >
              {isUpdatingProfile && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </GlassCard>

      {/* 3. Security: Change Password */}
      <GlassCard className="space-y-4">
        <div>
          <h2 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--aurora-gold)]" />
            Security & Password
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Update your login credentials securely
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="glass-input w-full h-11 sm:h-12 px-4 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="glass-input w-full h-11 sm:h-12 px-4 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="glass-input w-full h-11 sm:h-12 px-4 text-base sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword}
              className="btn-primary-glow h-11 px-5 text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {isChangingPassword && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </GlassCard>

      {/* 4. Category Management */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
              <Tag className="w-4 h-4 text-income" />
              Category Management
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Configure expense and income classification chips
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCatModalOpen(true)}
            className="h-10 px-3.5 rounded-[var(--radius-button)] text-xs font-semibold bg-income/15 text-income hover:bg-income/25 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 max-h-64 overflow-y-auto pr-1">
          {categories.map(c => (
            <div
              key={c.id}
              className="flex items-center justify-between p-2.5 rounded-[var(--radius-inner)] bg-[var(--surface)] border border-[var(--border)] group hover:bg-[var(--surface-hover)] transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${c.color}25`, color: c.color }}
                >
                  <CategoryIcon name={c.icon} className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {c.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteCat.mutate(c.id)}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 w-10 h-10 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-expense transition-all"
                title="Delete Category"
                aria-label={`Delete category ${c.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 5. Budget Management */}
      <GlassCard className="space-y-4">
        <div>
          <h2 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
            <Target className="w-4 h-4 text-expense" />
            Monthly Category Budgets
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Set or adjust monthly spending caps for your active categories
          </p>
        </div>

        <form
          onSubmit={handleSaveBudget}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <select
            value={selectedBudgetCat}
            onChange={e => setSelectedBudgetCat(e.target.value)}
            className="glass-input h-11 px-3 text-base sm:text-xs bg-[var(--bg-elevated)] flex-1"
          >
            <option value="">Select Category...</option>
            {categories
              .filter(c => c.type === "EXPENSE")
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>

          <input
            type="number"
            placeholder="Monthly Limit (e.g. 25000)"
            value={budgetLimit}
            onChange={e =>
              setBudgetLimit(e.target.value ? Number(e.target.value) : "")
            }
            className="glass-input h-11 px-3 text-base sm:text-xs flex-1 font-mono"
          />

          <button
            type="submit"
            disabled={
              !selectedBudgetCat || !budgetLimit || saveBudget.isPending
            }
            className="btn-primary-glow h-11 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Save Budget Cap
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
          {(budgetData?.budgets || []).map(b => (
            <div
              key={b.id}
              className="p-3 rounded-[var(--radius-inner)] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {b.category.name}
                </p>
                <p className="text-[11px] font-mono text-[var(--aurora-cyan)] mt-0.5">
                  Limit: {formatCurrency(b.limit, currency)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteBudget.mutate(b.id)}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 w-10 h-10 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-expense transition-colors"
                title="Remove Budget"
                aria-label={`Remove budget for ${b.category.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 6. Danger Zone */}
      <GlassCard className="border border-[var(--aurora-coral)]/40 bg-[var(--aurora-coral)]/5 space-y-4">
        <div>
          <h2 className="text-base font-bold font-heading text-[var(--aurora-coral)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Irreversible actions that permanently delete your financial
            footprint
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">
              Delete Entire Account
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Permanently purges your profile, all transactions, categories, and
              monthly budgets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-11 px-4 rounded-[var(--radius-button)] text-xs font-bold bg-[var(--aurora-coral)] hover:opacity-90 text-white transition-opacity shrink-0"
          >
            Delete Account
          </button>
        </div>
      </GlassCard>

      {/* Add Category Modal */}
      {isCatModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cat-modal-title"
          className="fixed inset-x-0 bottom-0 z-50 bg-black/60 backdrop-blur-sm md:inset-0 md:flex md:items-center md:justify-center p-0 md:p-4 animate-fade-in"
        >
          <form
            onSubmit={handleAddCategory}
            className="glass-card w-full max-w-md md:mx-auto p-6 space-y-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-t-[28px] md:rounded-[24px] max-h-[90dvh] overflow-y-auto"
          >
            <div className="md:hidden pt-2 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>
            <div className="flex items-center justify-between">
              <h3
                id="cat-modal-title"
                className="text-base font-bold font-heading text-[var(--text-primary)]"
              >
                Create New Category
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewCatType("EXPENSE")}
                className={`h-11 rounded-[var(--radius-button)] text-xs font-semibold ${
                  newCatType === "EXPENSE"
                    ? "bg-[var(--aurora-coral)] text-white"
                    : "bg-[var(--surface)] text-[var(--text-secondary)]"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setNewCatType("INCOME")}
                className={`h-11 rounded-[var(--radius-button)] text-xs font-semibold ${
                  newCatType === "INCOME"
                    ? "bg-[var(--aurora-mint)] text-black font-bold"
                    : "bg-[var(--surface)] text-[var(--text-secondary)]"
                }`}
              >
                Income
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs text-[var(--text-muted)]">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Subscriptions"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="glass-input w-full h-11 px-3 text-base sm:text-xs mt-1"
                required
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-xs text-[var(--text-muted)]">
                Select Color
              </label>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className={`w-9 h-9 rounded-full transition-transform ${
                      newCatColor === c ? "scale-125 ring-2 ring-white" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="text-xs text-[var(--text-muted)]">
                Select Icon
              </label>
              <div className="grid grid-cols-6 gap-2 mt-1.5 max-h-36 overflow-y-auto pr-1">
                {AVAILABLE_ICONS.map(iconName => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setNewCatIcon(iconName)}
                    className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
                      newCatIcon === iconName
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                    aria-label={`Select icon ${iconName}`}
                  >
                    <CategoryIcon name={iconName} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="h-11 rounded-[var(--radius-button)] text-xs font-semibold glass-card text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createCat.isPending}
                className="btn-primary-glow h-11 text-xs font-semibold"
              >
                {createCat.isPending ? "Creating..." : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-account-title"
          className="fixed inset-x-0 bottom-0 z-50 bg-black/70 backdrop-blur-sm md:inset-0 md:flex md:items-center md:justify-center p-0 md:p-4 animate-fade-in"
        >
          <div className="glass-card w-full md:max-w-sm p-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))] space-y-4 bg-[var(--bg-elevated)] border border-[var(--aurora-coral)]/40 text-center rounded-t-[28px] md:rounded-[24px]">
            <div className="md:hidden pt-2 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--aurora-coral)]/20 text-[var(--aurora-coral)] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3
              id="del-account-title"
              className="font-heading font-bold text-base text-[var(--text-primary)]"
            >
              Permanently Delete Account?
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              This action will completely erase your ledger history, custom
              categories, budgets, and access credentials. There is no recovery.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="h-11 rounded-[var(--radius-button)] text-xs font-semibold glass-card text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="h-11 rounded-[var(--radius-button)] text-xs font-semibold bg-[var(--aurora-coral)] hover:opacity-90 text-white"
              >
                {isDeletingAccount ? "Purging..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

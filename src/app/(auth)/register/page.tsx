"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validators";
import { AuthVisualHero } from "@/components/auth/auth-visual-hero";
import { Eye, EyeOff, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") || "";

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 5
  };

  const strength = getPasswordStrength(passwordValue);
  const strengthLabels = [
    "Very Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Superb",
  ];
  const strengthColors = [
    "bg-[var(--danger)]",
    "bg-orange-500",
    "bg-[var(--accent-gold)]",
    "bg-[var(--accent-cyan)]",
    "bg-[var(--income)]",
    "bg-[var(--income)]",
  ];

  const onSubmit = async (data: RegisterInput) => {
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMessage(resData.error || "Failed to create account");
        return;
      }

      toast.success("Account created! Signing you in...");

      // Automatically sign in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInRes?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg-base)]">
      {/* LEFT: 3D Expense Tracker Visual Hero */}
      <AuthVisualHero />

      {/* RIGHT: Register Form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative z-10 max-w-xl mx-auto w-full">
        {/* Mobile Brand Logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-inner bg-gradient-to-tr from-[var(--primary)] to-[var(--accent-cyan)] flex items-center justify-center shadow-glow-violet">
            <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl tracking-wide bg-gradient-to-r from-white to-[var(--accent-cyan)] bg-clip-text text-transparent">
              Expense Tracker
            </span>
            <span className="font-heading font-light text-[10px] block text-[var(--primary)] tracking-widest uppercase">
              Ledger
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-[clamp(24px,4vw,32px)] font-bold font-heading text-[var(--text-heading)]">
            Create an account
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            Join Expense Tracker Ledger and illuminate your financial horizon.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-inner bg-[var(--danger)]/15 border border-[var(--danger)]/40 text-[var(--danger)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Alex Vance"
              {...register("name")}
              className="glass-input w-full px-4 h-11 md:h-12 text-base md:text-sm focus:outline-none"
            />
            <div className="min-h-[16px]">
              {errors.name && (
                <p className="text-xs text-[var(--danger)] font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Email Address
            </label>
            <input
              type="email"
              placeholder="alex@example.com"
              {...register("email")}
              className="glass-input w-full px-4 h-11 md:h-12 text-base md:text-sm focus:outline-none"
            />
            <div className="min-h-[16px]">
              {errors.email && (
                <p className="text-xs text-[var(--danger)] font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 chars, 1 uppercase, 1 number"
                {...register("password")}
                className="glass-input w-full px-4 pr-11 h-11 md:h-12 text-base md:text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="w-9 h-9 flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded-inner"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <div className="min-h-[16px]">
              {errors.password && (
                <p className="text-xs text-[var(--danger)] font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password Strength Meter */}
            {passwordValue.length > 0 && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-muted)]">
                    Password Strength:
                  </span>
                  <span className="font-semibold text-[var(--text-heading)]">
                    {strengthLabels[strength]}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <div
                      key={lvl}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        strength >= lvl
                          ? strengthColors[strength]
                          : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className="glass-input w-full px-4 h-11 md:h-12 text-base md:text-sm focus:outline-none"
            />
            <div className="min-h-[16px]">
              {errors.confirmPassword && (
                <p className="text-xs text-[var(--danger)] font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-glow w-full h-12 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting && (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            )}
            <span>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Or sign up with
          </span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="glass-card hover:glass-card-hover w-full h-11 px-4 rounded-inner flex items-center justify-center gap-3 text-sm font-semibold text-[var(--text-heading)] transition-all focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--primary)] hover:text-[var(--accent-cyan)] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

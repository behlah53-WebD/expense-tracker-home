"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validators";
import { AuthVisualHero } from "@/components/auth/auth-visual-hero";
import { Eye, EyeOff, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        setErrorMessage(
          "Invalid email or password. Please verify and try again."
        );
        toast.error("Authentication failed");
        return;
      }

      toast.success("Welcome back to Expense Tracker Ledger!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again later.");
    }
  };

  const handleFillDemo = () => {
    setValue("email", "demo@Expense Trackerledger.com");
    setValue("password", "Password123!");
    toast.info("Demo credentials populated!");
  };

  return (
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
          Welcome back
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5">
          Sign in to access your glowing financial dashboard.
        </p>
      </div>

      {/* Demo Fast-Fill Banner */}
      <div className="mb-6 p-3.5 rounded-inner border border-[var(--primary)]/30 bg-[var(--primary)]/10 flex items-center justify-between">
        <div className="text-xs">
          <p className="font-semibold text-[var(--text-heading)] flex items-center gap-1.5">
            <Sparkles
              className="w-3.5 h-3.5 text-[var(--accent-cyan)]"
              aria-hidden="true"
            />{" "}
            Try Demo Account
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Preloaded with 6 months of realistic transactions
          </p>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="h-9 px-3.5 rounded-inner text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-glow)] text-white shadow-glow-violet transition-all focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
        >
          Auto Fill
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-inner bg-[var(--danger)]/15 border border-[var(--danger)]/40 text-[var(--danger)] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="min-h-[18px]">
            {errors.email && (
              <p className="text-xs text-[var(--danger)] font-medium">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Password
            </label>
            <a
              href="#forgot"
              onClick={e => {
                e.preventDefault();
                toast.info(
                  "Password reset link sent to registered email if account exists."
                );
              }}
              className="text-xs text-[var(--primary)] hover:text-[var(--accent-cyan)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded"
            >
              Forgot password?
            </a>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
          <div className="min-h-[18px]">
            {errors.password && (
              <p className="text-xs text-[var(--danger)] font-medium">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            {...register("rememberMe")}
            className="rounded border-[var(--border)] bg-transparent text-[var(--primary)] focus:ring-0 w-4 h-4 cursor-pointer"
          />
          <label
            htmlFor="rememberMe"
            className="text-xs text-[var(--text-secondary)] cursor-pointer select-none"
          >
            Remember me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary-glow w-full h-12 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting && (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          )}
          <span>
            {isSubmitting ? "Signing In..." : "Sign In to Expense Tracker"}
          </span>
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
          Or continue with
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
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
        <span>Continue with Google</span>
      </button>

      {/* Footer Link */}
      <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[var(--primary)] hover:text-[var(--accent-cyan)] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg-base)]">
      {/* LEFT: 3D Parallax Expense Tracker Visual Hero */}
      <AuthVisualHero />

      {/* RIGHT: Login Form inside Suspense */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-xs text-[var(--text-muted)]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing
            security session...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

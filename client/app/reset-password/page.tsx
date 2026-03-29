"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { validatePassword, validateConfirmPassword } from "@/lib/validation";
import { AuthFormLayout } from "@/components/auth/auth-form-layout";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuth } from "@/context/auth-context";

const DEBOUNCE_MS = 400;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const debouncedPassword = useDebounce(newPassword, DEBOUNCE_MS);
  const passwordValidation = validatePassword(debouncedPassword);
  const confirmValidation = validateConfirmPassword(confirmPassword, newPassword);

  const passwordValid = passwordValidation.valid;
  const confirmValid = confirmValidation.valid;
  const showPasswordError = passwordTouched && !passwordValid;
  const showConfirmError = confirmTouched && passwordValid && !confirmValid;
  const passwordError = showPasswordError ? passwordValidation.message : "";
  const confirmError = showConfirmError ? confirmValidation.message : "";
  const formValid = passwordValid && confirmValid;

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formValid || !token || isLoading) return;
      try {
        await resetPassword(token, newPassword);
        setSuccess(true);
      } catch {
        // error set in context
      }
    },
    [formValid, token, isLoading, resetPassword, newPassword]
  );

  if (success) {
    return (
      <AuthFormLayout
        title="Password reset"
        alternateHref="/login"
        alternateLabel="Log in"
        alternatePrompt=""
      >
        <div className="mt-6 space-y-4">
          <p className="text-muted-foreground">
            Your password has been reset. You can now log in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-flex w-full justify-center rounded-[var(--radius)] bg-accent py-3 text-base font-medium text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
          >
            Go to login
          </Link>
        </div>
      </AuthFormLayout>
    );
  }

  if (!token) {
    return (
      <AuthFormLayout
        title="Invalid link"
        alternateHref="/forgot-password"
        alternateLabel="Request new link"
        alternatePrompt=""
      >
        <p className="mt-6 text-muted-foreground">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-flex w-full justify-center rounded-[var(--radius)] bg-accent py-3 text-base font-medium text-on-accent transition-colors hover:bg-accent/90"
        >
          Forgot password
        </Link>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout
      title="Set new password"
      alternateHref="/login"
      alternateLabel="Back to login"
      alternatePrompt=""
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-[var(--radius-sm)] border border-[var(--color-error)] bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]"
          >
            {error}
          </div>
        )}
        <AuthFormField
          label="New password"
          type="password"
          value={newPassword}
          onChange={(v) => {
            setNewPassword(v);
            setPasswordTouched(true);
          }}
          onBlur={() => setPasswordTouched(true)}
          error={passwordError}
          hasShake={!!passwordError}
          autoComplete="new-password"
          showPasswordToggle
        />
        <AuthFormField
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            setConfirmTouched(true);
          }}
          onBlur={() => setConfirmTouched(true)}
          onFocus={() => setPasswordTouched(true)}
          error={confirmError}
          hasShake={!!confirmError}
          autoComplete="new-password"
          showPasswordToggle
        />
        <div className="pt-1">
          <button
            type="submit"
            disabled={!formValid || isLoading}
            className="w-full rounded-[var(--radius)] bg-accent py-3 text-base font-medium text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Resetting…" : "Reset password"}
          </button>
        </div>
      </form>
    </AuthFormLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { validateEmail } from "@/lib/validation";
import { AuthFormLayout } from "@/components/auth/auth-form-layout";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuth } from "@/context/auth-context";

const DEBOUNCE_MS = 400;

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const debouncedEmail = useDebounce(email, DEBOUNCE_MS);
  const emailValidation = validateEmail(debouncedEmail);
  const emailValid = emailValidation.valid;
  const showEmailError = emailTouched && !emailValid;
  const emailError = showEmailError ? emailValidation.message : "";

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!emailValid || isLoading) return;
      try {
        await forgotPassword(email.trim());
        setSuccess(true);
      } catch {
        // error set in context
      }
    },
    [emailValid, isLoading, forgotPassword, email]
  );

  if (success) {
    return (
      <AuthFormLayout
        title="Check your email"
        alternateHref="/login"
        alternateLabel="Back to login"
        alternatePrompt=""
      >
        <div className="mt-6 space-y-4">
          <p className="text-muted-foreground">
            If an account exists for <strong className="text-primary">{email}</strong>, you will
            receive a password reset link shortly.
          </p>
          <p className="text-sm text-muted-foreground">
            Didn’t receive it? Check spam or{" "}
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="font-medium text-accent hover:underline"
            >
              try again
            </button>
            .
          </p>
        </div>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout
      title="Forgot password"
      alternateHref="/login"
      alternateLabel="Back to login"
      alternatePrompt="Remember your password?"
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
        <p className="text-sm text-muted-foreground">
          Enter your email and we’ll send you a link to reset your password.
        </p>
        <AuthFormField
          label="Email"
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setEmailTouched(true);
          }}
          onBlur={() => setEmailTouched(true)}
          error={emailError}
          hasShake={!!emailError}
          autoComplete="email"
        />
        <div className="pt-1">
          <button
            type="submit"
            disabled={!emailValid || isLoading}
            className="w-full rounded-[var(--radius)] bg-accent py-3 text-base font-medium text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Sending…" : "Send reset link"}
          </button>
        </div>
      </form>
    </AuthFormLayout>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateFullName,
} from "@/lib/validation";
import { AuthFormLayout } from "@/components/auth/auth-form-layout";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuth } from "@/context/auth-context";

const DEBOUNCE_MS = 600;

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"customer" | "admin_request">("customer");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const debouncedFullName = useDebounce(fullName, DEBOUNCE_MS);
  const debouncedEmail = useDebounce(email, DEBOUNCE_MS);
  const debouncedPassword = useDebounce(password, DEBOUNCE_MS);

  const fullNameValidation = validateFullName(debouncedFullName);
  const emailValidation = validateEmail(debouncedEmail);
  const passwordValidation = validatePassword(debouncedPassword);
  const confirmValidation = validateConfirmPassword(confirmPassword, password);

  const fullNameValid = fullNameValidation.valid;
  const emailValid = emailValidation.valid;
  const passwordValid = passwordValidation.valid;
  const confirmValid = confirmValidation.valid;

  const showFullNameError =
    (fullNameTouched || emailTouched) && !fullNameValid;
  const showEmailError =
    (emailTouched || passwordTouched || confirmTouched) && !emailValid;
  const showPasswordError =
    (passwordTouched || confirmTouched) && emailValid && !passwordValid;
  const showConfirmError =
    confirmTouched && emailValid && passwordValid && !confirmValid;

  const fullNameError = showFullNameError ? fullNameValidation.message : "";
  const emailError = showEmailError ? emailValidation.message : "";
  const passwordError = showPasswordError ? passwordValidation.message : "";
  const confirmError = showConfirmError ? confirmValidation.message : "";

  const formValid =
    fullNameValid &&
    emailValid &&
    passwordValid &&
    confirmValid &&
    termsAccepted;

  useEffect(() => {
    if (isAuthenticated) router.replace("/home");
  }, [isAuthenticated, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formValid || isLoading) return;
      try {
        await register(fullName.trim(), email.trim(), password, role);
        router.replace("/home");
      } catch {
        // error set in context
      }
    },
    [formValid, isLoading, register, fullName, email, password, role, router]
  );

  return (
    <AuthFormLayout
      title="Create account"
      alternateHref="/login"
      alternateLabel="Log in"
      alternatePrompt="Already have an account?"
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
          label="Full name"
          type="text"
          value={fullName}
          onChange={(v) => {
            setFullName(v);
            setFullNameTouched(true);
          }}
          onBlur={() => setFullNameTouched(true)}
          error={fullNameError}
          hasShake={!!fullNameError}
          autoComplete="name"
        />
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
        <AuthFormField
          label="Password"
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setPasswordTouched(true);
          }}
          onBlur={() => setPasswordTouched(true)}
          onFocus={() => setEmailTouched(true)}
          error={passwordError}
          hasShake={!!passwordError}
          autoComplete="new-password"
          showPasswordToggle
        />
        <AuthFormField
          label="Confirm password"
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
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "customer" | "admin_request")}
            className="block w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
          >
            <option value="customer">Customer</option>
            <option value="admin_request">Request Admin access</option>
          </select>
          {role === "admin_request" && (
            <p className="text-xs text-muted-foreground">
              Your account will be created as Customer. An admin can upgrade your role later.
            </p>
          )}
        </div>
        <label className="flex items-start gap-2 text-sm text-primary">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-accent focus-visible:ring-accent"
          />
          <span>
            I agree to the{" "}
            <Link href="/#" className="text-accent hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/#" className="text-accent hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        <div className="pt-1">
          <button
            type="submit"
            disabled={!formValid || isLoading}
            className="w-full rounded-[var(--radius)] bg-accent py-3 text-base font-medium text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent"
          >
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </div>
      </form>
    </AuthFormLayout>
  );
}

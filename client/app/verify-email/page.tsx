"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AuthFormLayout } from "@/components/auth/auth-form-layout";
import { toApiError } from "@/api/axios";

function safeRedirect(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/home";
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmailToken, isLoading, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const token = searchParams.get("token") ?? "";
  const redirect = safeRedirect(searchParams.get("redirect"));

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        await verifyEmailToken(token);
        if (!cancelled) router.replace(redirect);
      } catch (e) {
        if (!cancelled) setLocalError(toApiError(e).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, redirect, router, verifyEmailToken]);

  if (!token) {
    return (
      <AuthFormLayout title="Invalid link" alternateHref="/login" alternateLabel="Log in" alternatePrompt="">
        <p className="mt-6 text-muted-foreground">
          This verification link is missing a token. Request a new link from your account or sign up again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex w-full justify-center rounded-[var(--radius)] bg-accent py-3 text-base font-medium text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
        >
          Go to login
        </Link>
      </AuthFormLayout>
    );
  }

  if (localError) {
    return (
      <AuthFormLayout title="Could not verify email" alternateHref="/login" alternateLabel="Log in" alternatePrompt="">
        <p className="mt-6 text-muted-foreground">{localError}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          The link may have expired. You can try signing in — if your account is not verified yet, request a new
          confirmation email from your profile when that option is available.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex w-full justify-center rounded-[var(--radius)] bg-accent py-3 text-base font-medium text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
        >
          Go to login
        </Link>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout title="Verifying your email" alternateHref="/login" alternateLabel="Log in" alternatePrompt="">
      <div className="mt-8 flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent"
          aria-hidden
        />
        <p className="text-center text-sm text-muted-foreground">
          {isLoading ? "Confirming your address…" : "Taking you to your account…"}
        </p>
      </div>
    </AuthFormLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

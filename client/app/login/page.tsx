"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { validateEmail, validatePassword } from "@/lib/validation";
import { AuthFormLayout } from "@/components/auth/auth-form-layout";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuth } from "@/context/auth-context";

const DEBOUNCE_MS = 600;

const DEMO_CREDENTIALS = [
  {
    role: "Customer",
    email: "customer@shopsmart.com",
    password: "Customer1!",
    color: "hsl(210 80% 55%)",
    initial: "C",
  },
  {
    role: "Admin",
    email: "admin@shopsmart.com",
    password: "Admin123!",
    color: "hsl(38 90% 52%)",
    initial: "A",
  },
  {
    role: "Super Admin",
    email: "super_admin@shopsmart.com",
    password: "Admin123!",
    color: "hsl(280 70% 60%)",
    initial: "S",
  },
] as const;

function DemoCredentialsPanel({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filledIndex, setFilledIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    const cred = DEMO_CREDENTIALS[index];
    onSelect(cred.email, cred.password);
    setFilledIndex(index);
    setTimeout(() => setOpen(false), 420);
  };

  return (
    <div className="demo-panel-root">
      <style>{`
        .demo-panel-root {
          position: relative;
        }

        /* Toggle button */
        .demo-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: var(--radius-sm);
          border: 1.5px dashed var(--color-border, hsl(220 13% 82%));
          background: transparent;
          color: var(--color-muted-foreground, hsl(220 9% 46%));
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
          letter-spacing: 0.01em;
        }
        .demo-toggle:hover {
          border-color: var(--color-accent, hsl(215 90% 54%));
          color: var(--color-accent, hsl(215 90% 54%));
          background: color-mix(in srgb, var(--color-accent, hsl(215 90% 54%)) 5%, transparent);
        }
        .demo-toggle:focus-visible {
          outline: 2px solid var(--color-accent, hsl(215 90% 54%));
          outline-offset: 2px;
        }

        /* Chevron */
        .demo-chevron {
          width: 14px;
          height: 14px;
          transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
        }
        .demo-chevron.open {
          transform: rotate(180deg);
        }

        /* Sparkle icon */
        .demo-sparkle {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          opacity: 0.75;
        }

        /* Dropdown container — CSS grid trick for smooth height animation */
        .demo-dropdown {
          overflow: hidden;
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .demo-dropdown.open {
          grid-template-rows: 1fr;
        }
        .demo-dropdown-inner {
          min-height: 0;
        }
        .demo-list {
          padding-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Credential row */
        .demo-cred-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border, hsl(220 13% 82%));
          background: var(--color-surface, #fff);
          cursor: pointer;
          text-align: left;
          transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease, background 150ms ease;
          position: relative;
          overflow: hidden;
        }
        .demo-cred-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--cred-color);
          opacity: 0;
          transition: opacity 150ms ease;
        }
        .demo-cred-btn:hover::before {
          opacity: 0.04;
        }
        .demo-cred-btn:hover {
          border-color: var(--cred-color);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--cred-color) 12%, transparent);
          transform: translateY(-1px);
        }
        .demo-cred-btn:active {
          transform: translateY(0px);
        }
        .demo-cred-btn:focus-visible {
          outline: 2px solid var(--cred-color);
          outline-offset: 2px;
        }

        /* Filled state */
        .demo-cred-btn.filled {
          border-color: var(--cred-color);
          background: color-mix(in srgb, var(--cred-color) 6%, var(--color-surface, #fff));
          animation: cred-pop 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes cred-pop {
          0% { transform: scale(1); }
          45% { transform: scale(1.025); }
          100% { transform: scale(1); }
        }

        /* Avatar dot */
        .demo-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--cred-color);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
          letter-spacing: 0;
          position: relative;
          z-index: 1;
          box-shadow: 0 1px 4px color-mix(in srgb, var(--cred-color) 40%, transparent);
        }

        /* Text content */
        .demo-cred-text {
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 1;
        }
        .demo-cred-role {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-primary, hsl(220 20% 14%));
          line-height: 1.2;
        }
        .demo-cred-email {
          font-size: 11.5px;
          color: var(--color-muted-foreground, hsl(220 9% 46%));
          line-height: 1.4;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Arrow & checkmark */
        .demo-cred-action {
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .demo-arrow {
          color: var(--color-muted-foreground, hsl(220 9% 46%));
          transition: color 150ms, transform 150ms;
          width: 14px;
          height: 14px;
        }
        .demo-cred-btn:hover .demo-arrow {
          color: var(--cred-color);
          transform: translateX(2px);
        }
        .demo-check {
          color: var(--cred-color);
          width: 14px;
          height: 14px;
          animation: check-pop 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes check-pop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Hint label */
        .demo-hint {
          font-size: 10.5px;
          color: var(--color-muted-foreground, hsl(220 9% 46%));
          text-align: center;
          padding-top: 2px;
          opacity: 0.75;
        }
      `}</style>

      <button
        type="button"
        className="demo-toggle"
        onClick={() => {
          setOpen((o) => !o);
          setFilledIndex(null);
        }}
        aria-expanded={open}
      >
        {/* sparkle icon */}
        <svg className="demo-sparkle" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 1.5L9.09 5.91L13.5 7L9.09 8.09L8 12.5L6.91 8.09L2.5 7L6.91 5.91L8 1.5Z" fill="currentColor"/>
          <path d="M13 10.5L13.6 12.4L15.5 13L13.6 13.6L13 15.5L12.4 13.6L10.5 13L12.4 12.4L13 10.5Z" fill="currentColor" opacity="0.6"/>
        </svg>
        Try with demo credentials
        <svg
          className={`demo-chevron ${open ? "open" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={`demo-dropdown ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="demo-dropdown-inner">
          <div className="demo-list">
            {DEMO_CREDENTIALS.map((cred, i) => (
              <button
                key={cred.role}
                type="button"
                className={`demo-cred-btn${filledIndex === i ? " filled" : ""}`}
                style={{ "--cred-color": cred.color } as React.CSSProperties}
                onClick={() => handleSelect(i)}
                tabIndex={open ? 0 : -1}
              >
                <span className="demo-avatar">{cred.initial}</span>
                <span className="demo-cred-text flex flex-col items-start gap-0.5">
                  <span className="demo-cred-role">{cred.role}</span>
                  <span className="demo-cred-email">{cred.email}</span>
                </span>
                <span className="demo-cred-action">
                  {filledIndex === i ? (
                    <svg className="demo-check" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg className="demo-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
              </button>
            ))}
            <p className="demo-hint">Clicking a role auto-fills the form above</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/home";
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const debouncedEmail = useDebounce(email, DEBOUNCE_MS);
  const debouncedPassword = useDebounce(password, DEBOUNCE_MS);

  const emailValidation = validateEmail(debouncedEmail);
  const passwordValidation = validatePassword(debouncedPassword);

  const emailValid = emailValidation.valid;
  const passwordValid = passwordValidation.valid;

  const showEmailError = (emailTouched || passwordTouched) && !emailValid;
  const showPasswordError = passwordTouched && emailValid && !passwordValid;

  const emailError = showEmailError ? emailValidation.message : "";
  const passwordError = showPasswordError ? passwordValidation.message : "";

  const formValid = emailValid && passwordValid;

  useEffect(() => {
    if (isAuthenticated) router.replace(redirect);
  }, [isAuthenticated, redirect, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formValid || isLoading) return;
      try {
        await login(email.trim(), password, rememberMe);
        router.replace(redirect);
      } catch {
        // error set in context
      }
    },
    [formValid, isLoading, login, email, password, rememberMe, redirect, router]
  );

  const handleDemoSelect = useCallback((demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setEmailTouched(true);
    setPasswordTouched(true);
  }, []);

  return (
    <AuthFormLayout
      title="Log in"
      alternateHref="/signup"
      alternateLabel="Create an account"
      alternatePrompt="Don't have an account?"
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
          autoComplete="current-password"
          showPasswordToggle
        />
        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm text-primary">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus-visible:ring-accent"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
          >
            Forgot password?
          </Link>
        </div>
        <div className="pt-1">
          <button
            type="submit"
            disabled={!formValid || isLoading}
            className="w-full rounded-[var(--radius)] bg-accent py-3 text-base font-medium text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent"
          >
            {isLoading ? "Signing in…" : "Log in"}
          </button>
        </div>

        {/* Demo credentials — replaces the "coming soon" OAuth buttons */}
        <DemoCredentialsPanel onSelect={handleDemoSelect} />

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/home"
            className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
          >
            Continue as guest
          </Link>
        </p>
      </form>
    </AuthFormLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
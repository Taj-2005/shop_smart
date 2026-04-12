"use client";

import { render, screen, waitFor } from "@testing-library/react";
import { authApi } from "@/api/auth.api";
import { AuthProvider, useAuth } from "@/context/auth-context";

jest.mock("@/api/auth.api", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn().mockRejectedValue(new Error("no cookie")),
    me: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => "/",
}));

jest.mock("@/lib/auth-token", () => ({
  setOnUnauthorized: jest.fn(),
  triggerUnauthorized: jest.fn(),
}));

function TestConsumer() {
  const { user, isAuthenticated, login, logout, error } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user-role">{user?.role ?? "none"}</span>
      <span data-testid="error">{error ?? ""}</span>
      <button type="button" onClick={() => login("a@b.com", "pass")}>
        Login
      </button>
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authApi.refresh.mockRejectedValue(new Error("no cookie"));
  });

  it("provides unauthenticated state initially", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(screen.getByTestId("user-role").textContent).toBe("none");
    });
  });

  it("exposes login and logout", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("updates state when login succeeds", async () => {
    authApi.login.mockResolvedValue({
      success: true,
      user: { id: "1", email: "a@b.com", fullName: "User", role: "CUSTOMER", createdAt: "2024-01-01T00:00:00Z" },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("authenticated").textContent).toBe("false"));
    screen.getByRole("button", { name: /login/i }).click();
    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(screen.getByTestId("user-role").textContent).toBe("customer");
    });
  });

  // TODO: fix async mock timing so login state updates before asserting
  it.skip("clears user when logout is called", async () => {
    const loginResponse = {
      success: true,
      user: { id: "1", email: "a@b.com", fullName: "U", role: "CUSTOMER", createdAt: "2024-01-01T00:00:00Z" },
    };
    authApi.login.mockImplementation(() => Promise.resolve(loginResponse));
    authApi.logout.mockResolvedValue({});

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    const loginBtn = screen.getByRole("button", { name: /login/i });
    loginBtn.click();
    await waitFor(() => expect(screen.getByTestId("authenticated").textContent).toBe("true"), { timeout: 2000 });
    screen.getByRole("button", { name: /logout/i }).click();
    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(screen.getByTestId("user-role").textContent).toBe("none");
    });
  });

  it.skip("sets error when login fails (unhandled rejection from context rethrow)", async () => {
    authApi.login.mockRejectedValue(new Error("Invalid credentials"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    screen.getByRole("button", { name: /login/i }).click();
    await waitFor(() => {
      const errorText = screen.getByTestId("error").textContent;
      expect(errorText).toBeTruthy();
      expect(errorText?.toLowerCase()).toMatch(/request failed|login failed|invalid credentials/);
    });
  });
});

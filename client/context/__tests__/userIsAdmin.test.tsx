"use client";

import { render, screen } from "@testing-library/react";
import { AuthProvider, useIsAdmin, useIsSuperAdmin } from "@/context/auth-context";

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

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock("@/lib/auth-token", () => ({
  setOnUnauthorized: jest.fn(),
  triggerUnauthorized: jest.fn(),
}));

function ShowAdmin() {
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  return (
    <div>
      <span data-testid="is-admin">{String(isAdmin)}</span>
      <span data-testid="is-super-admin">{String(isSuperAdmin)}</span>
    </div>
  );
}

describe("useIsAdmin / useIsSuperAdmin", () => {
  it("returns false when not authenticated", async () => {
    render(
      <AuthProvider>
        <ShowAdmin />
      </AuthProvider>
    );
    await new Promise((r) => setTimeout(r, 150));
    expect(screen.getByTestId("is-admin").textContent).toBe("false");
    expect(screen.getByTestId("is-super-admin").textContent).toBe("false");
  });

  it("returns true for isAdmin when user role is admin", async () => {
    const { authApi } = require("@/api/auth.api");
    authApi.refresh.mockResolvedValue({
      success: true,
      user: { id: "1", email: "a@b.com", fullName: "Admin", role: "ADMIN", createdAt: "2024-01-01T00:00:00Z" },
    });

    render(
      <AuthProvider>
        <ShowAdmin />
      </AuthProvider>
    );
    await new Promise((r) => setTimeout(r, 150));
    expect(screen.getByTestId("is-admin").textContent).toBe("true");
    expect(screen.getByTestId("is-super-admin").textContent).toBe("false");
  });

  it("returns true for isSuperAdmin when user role is super_admin", async () => {
    const { authApi } = require("@/api/auth.api");
    authApi.refresh.mockResolvedValue({
      success: true,
      user: { id: "1", email: "a@b.com", fullName: "Super", role: "SUPER_ADMIN", createdAt: "2024-01-01T00:00:00Z" },
    });

    render(
      <AuthProvider>
        <ShowAdmin />
      </AuthProvider>
    );
    await new Promise((r) => setTimeout(r, 150));
    expect(screen.getByTestId("is-admin").textContent).toBe("true");
    expect(screen.getByTestId("is-super-admin").textContent).toBe("true");
  });
});

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { userApi, type ApiUser } from "@/api/user.api";
import { toApiError } from "@/api/axios";

function roleDisplay(role: ApiUser["role"]): string {
  if (typeof role === "object" && role?.name) return role.name;
  return String(role ?? "").replace("_", " ");
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [assignRoleUserId, setAssignRoleUserId] = useState<string | null>(null);
  const [assignRoleValue, setAssignRoleValue] = useState<"ADMIN" | "CUSTOMER">("CUSTOMER");
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    userApi
      .list()
      .then((res) => {
        if (res.success && res.data) setUsers(res.data);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const r = roleDisplay(u.role);
    const matchSearch =
      (u.email?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (u.fullName?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || r === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAssignRole = async () => {
    if (!assignRoleUserId) return;
    setAssignError(null);
    setAssignSubmitting(true);
    try {
      await userApi.updateRole(assignRoleUserId, assignRoleValue);
      const res = await userApi.list();
      if (res.success && res.data) setUsers(res.data);
      setAssignRoleUserId(null);
    } catch (e) {
      setAssignError(toApiError(e).message ?? "Failed to update role");
    } finally {
      setAssignSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error)]/10 p-6 text-[var(--color-error)]">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
          Users
        </h1>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-accent"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm text-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="all">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-semibold text-primary">User</th>
              <th className="px-4 py-3 font-semibold text-primary">Role</th>
              <th className="px-4 py-3 font-semibold text-primary">Status</th>
              <th className="px-4 py-3 font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const roleStr = roleDisplay(u.role);
              const isSuperAdmin = currentUser?.role === "super_admin";
              const canAssign = isSuperAdmin && roleStr !== "SUPER_ADMIN";
              return (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary">{u.fullName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{roleStr.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.active !== false ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {u.active !== false ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="flex flex-col px-4 py-3 items-start gap-2">
                    <Link href={`/profile`} className="text-accent hover:underline">
                      View
                    </Link>
                    {canAssign && (
                      <>
                        {" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAssignRoleUserId(u.id);
                            setAssignRoleValue(roleStr === "ADMIN" ? "CUSTOMER" : "ADMIN");
                            setAssignError(null);
                          }}
                          className="text-accent hover:underline"
                        >
                          Assign role
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {assignRoleUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="assign-role-title">
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-lg">
            <h2 id="assign-role-title" className="font-heading text-lg font-semibold text-primary">
              Assign role
            </h2>
            {assignError && <p className="mt-2 text-sm text-[var(--color-error)]">{assignError}</p>}
            <div className="mt-4">
              <label htmlFor="assign-role-select" className="block text-sm font-medium text-primary">
                New role
              </label>
              <select
                id="assign-role-select"
                value={assignRoleValue}
                onChange={(e) => setAssignRoleValue(e.target.value as "ADMIN" | "CUSTOMER")}
                className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-primary"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setAssignRoleUserId(null)}
                className="flex-1 rounded-[var(--radius-sm)] border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignRole}
                disabled={assignSubmitting}
                className="flex-1 rounded-[var(--radius-sm)] bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent/90 disabled:opacity-50"
              >
                {assignSubmitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

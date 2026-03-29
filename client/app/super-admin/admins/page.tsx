"use client";

import { useState, useEffect } from "react";
import { userApi, type ApiUser } from "@/api/user.api";
import { superAdminApi } from "@/api/super-admin.api";
import { toApiError } from "@/api/axios";

function roleDisplay(role: ApiUser["role"]): string {
  if (typeof role === "object" && role?.name) return role.name;
  return String(role ?? "").replace("_", " ");
}

export default function SuperAdminAdminsPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createFullName, setCreateFullName] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    userApi
      .list()
      .then((res) => {
        if (res.success && res.data) setUsers(res.data);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const admins = users.filter((u) => {
    const r = roleDisplay(u.role);
    return r === "ADMIN" || r === "SUPER_ADMIN";
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim() || !createPassword.trim()) return;
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      await superAdminApi.createAdmin({
        email: createEmail.trim(),
        password: createPassword,
        fullName: createFullName.trim() || undefined,
      });
      const res = await userApi.list();
      if (res.success && res.data) setUsers(res.data);
      setShowCreate(false);
      setCreateEmail("");
      setCreatePassword("");
      setCreateFullName("");
    } catch (err) {
      setCreateError(toApiError(err).message ?? "Failed to create admin");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this admin?")) return;
    try {
      await superAdminApi.deleteAdmin(id);
      const res = await userApi.list();
      if (res.success && res.data) setUsers(res.data);
    } catch {
      setError("Failed to delete admin");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">Admins</h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-[var(--radius)] bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent/90"
        >
          Create Admin
        </button>
      </div>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-semibold text-primary">User</th>
              <th className="px-4 py-3 font-semibold text-primary">Role</th>
              <th className="px-4 py-3 font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-primary">{u.fullName}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{roleDisplay(u.role).replace("_", " ")}</td>
                <td className="px-4 py-3">
                  {roleDisplay(u.role) !== "SUPER_ADMIN" && (
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      className="text-[var(--color-error)] hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-lg">
            <h2 className="font-heading text-lg font-semibold text-primary">Create Admin</h2>
            {createError && <p className="mt-2 text-sm text-[var(--color-error)]">{createError}</p>}
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label htmlFor="sa-email" className="block text-sm font-medium text-primary">Email</label>
                <input id="sa-email" type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-primary" required />
              </div>
              <div>
                <label htmlFor="sa-password" className="block text-sm font-medium text-primary">Password</label>
                <input id="sa-password" type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-primary" required minLength={8} />
              </div>
              <div>
                <label htmlFor="sa-fullName" className="block text-sm font-medium text-primary">Full name (optional)</label>
                <input id="sa-fullName" type="text" value={createFullName} onChange={(e) => setCreateFullName(e.target.value)} className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-primary" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-[var(--radius-sm)] border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-muted">Cancel</button>
                <button type="submit" disabled={createSubmitting} className="flex-1 rounded-[var(--radius-sm)] bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent/90 disabled:opacity-50">{createSubmitting ? "Creating…" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/context/auth-context";

const NAV = [
  { href: "/super-admin", label: "Analytics" },
  { href: "/super-admin/admins", label: "Admins" },
  { href: "/super-admin/config", label: "System config" },
  { href: "/super-admin/feature-flags", label: "Feature flags" },
  { href: "/super-admin/payment", label: "Payment" },
  { href: "/super-admin/shipping", label: "Shipping" },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-surface"
      aria-label="Super Admin navigation"
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Logo size={28} />
        <span className="font-heading font-semibold text-primary">Super Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || (href !== "/super-admin" && pathname?.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-muted hover:text-primary"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 border-t border-border pt-3">
          <Link
            href="/admin"
            className="flex items-center justify-between rounded-[var(--radius-sm)] bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
          >
            ← Admin dashboard
          </Link>
        </div>
      </nav>
      <div className="border-t border-border p-3">
        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        <p className="truncate text-xs font-medium text-primary">{user?.fullName}</p>
        <div className="mt-3 flex flex-col gap-1.5">
          <Link
            href="/home"
            className="flex items-center justify-between rounded-[var(--radius-sm)] bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
          >
            Visit Store
            <span aria-hidden="true">↗</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-between rounded-[var(--radius-sm)] bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 w-full"
          >
            Log out
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ChevronRight,
  CircleUserRound,
  MessageSquare,
  Settings,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";

type Role = "owner" | "admin" | "agent" | "member";

interface NavigationItem {
  name: string;
  href: string;
  icon: typeof BarChart3;
  roles: Role[];
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    roles: ["owner", "admin", "agent", "member"],
  },
  {
    name: "Organizations",
    href: "/organizations",
    icon: Building2,
    roles: ["owner", "admin"],
  },
  {
    name: "Customers",
    href: "/customers",
    icon: CircleUserRound,
    roles: ["owner", "admin", "agent"],
  },
  {
    name: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
    roles: ["owner", "admin", "agent", "member"],
  },
];

const secondaryNavigation: NavigationItem[] = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["owner", "admin", "agent", "member"],
  },
];

function getInitials(
  fullName: string | null,
  email: string,
): string {
  if (fullName?.trim()) {
    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

function normalizeRole(role: string | undefined): Role {
  if (
    role === "owner" ||
    role === "admin" ||
    role === "agent" ||
    role === "member"
  ) {
    return role;
  }

  return "member";
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const fullName = user?.full_name || "User";
  const email = user?.email || "";

  const role = normalizeRole(user?.membership?.role);

  const initials = getInitials(
    user?.full_name ?? null,
    email,
  );

  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(role),
  );

  const visibleSecondaryNavigation =
    secondaryNavigation.filter((item) =>
      item.roles.includes(role),
    );

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            AI
          </div>

          <div>
            <p className="text-sm font-bold text-text">
              Support Hub
            </p>

            <p className="text-xs text-text-muted">
              Business Support
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-8 overflow-y-auto px-3 py-6"
        aria-label="Main navigation"
      >
        <div>
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Workspace
          </p>

          <div className="space-y-1">
            {visibleNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-light text-primary"
                      : "text-text-secondary hover:bg-surface-muted hover:text-text"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.25 : 2}
                    className={
                      isActive
                        ? "text-primary"
                        : "text-text-muted group-hover:text-text"
                    }
                    aria-hidden="true"
                  />

                  <span className="flex-1">
                    {item.name}
                  </span>

                  {isActive && (
                    <ChevronRight
                      size={15}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {visibleSecondaryNavigation.length > 0 && (
          <div>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              System
            </p>

            <div className="space-y-1">
              {visibleSecondaryNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-light text-primary"
                        : "text-text-secondary hover:bg-surface-muted hover:text-text"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.25 : 2}
                      className={
                        isActive
                          ? "text-primary"
                          : "text-text-muted group-hover:text-text"
                      }
                      aria-hidden="true"
                    />

                    <span className="flex-1">
                      {item.name}
                    </span>

                    {isActive && (
                      <ChevronRight
                        size={15}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {fullName}
            </p>

            <p className="truncate text-xs text-text-muted">
              {email}
            </p>

            <p className="mt-0.5 text-xs font-medium capitalize text-primary">
              {role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
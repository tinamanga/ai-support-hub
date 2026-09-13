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

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Organizations",
    href: "/organizations",
    icon: Building2,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: CircleUserRound,
  },
  {
    name: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            AI
          </div>

          <div>
            <p className="text-sm font-bold text-text">Support Hub</p>
            <p className="text-xs text-text-muted">Business Support</p>
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
            {navigation.map((item) => {
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

                  <span className="flex-1">{item.name}</span>

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

        <div>
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            System
          </p>

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
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

                  <span className="flex-1">{item.name}</span>

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
      </nav>

      {/* User area */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
            CM
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              Christina Manga
            </p>

            <p className="truncate text-xs text-text-muted">
              Software Engineer
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
"use client";

import { useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";

export default function TopNav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fullName = user?.full_name || "User";
  const email = user?.email || "";

  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || email.slice(0, 2).toUpperCase();

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.replace("/login");
  }

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <button
        type="button"
        className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text lg:hidden"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <X size={20} aria-hidden="true" />
        ) : (
          <Menu size={20} aria-hidden="true" />
        )}
      </button>

      <div className="hidden lg:block">
        <p className="text-sm font-medium text-text-secondary">
          AI Support Hub
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
          aria-label="Notifications"
        >
          <Bell size={19} strokeWidth={2} aria-hidden="true" />

          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-complementary"
            aria-hidden="true"
          />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((current) => !current)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface-muted"
            aria-label="Open user menu"
            aria-expanded={userMenuOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
              {initials}
            </div>

            <span className="hidden max-w-32 truncate text-sm font-medium text-text sm:block">
              {fullName}
            </span>

            <ChevronDown
              size={15}
              className="hidden text-text-muted sm:block"
              aria-hidden="true"
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-surface p-2 shadow-lg">
              <div className="border-b border-border px-3 py-2">
                <p className="truncate text-sm font-semibold text-text">
                  {fullName}
                </p>

                <p className="mt-0.5 truncate text-xs text-text-muted">
                  {email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-light"
              >
                <LogOut size={17} aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-border bg-surface p-4 shadow-md lg:hidden">
          <p className="text-sm font-medium text-text">
            Navigation
          </p>

          <p className="mt-1 text-xs text-text-muted">
            Mobile navigation will be connected in the next step.
          </p>
        </div>
      )}
    </header>
  );
}
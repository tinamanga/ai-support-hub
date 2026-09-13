"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      {/* Mobile menu */}
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

      {/* Desktop heading */}
      <div className="hidden lg:block">
        <p className="text-sm font-medium text-text-secondary">
          AI Support Hub
        </p>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
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

        {/* User menu */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface-muted"
          aria-label="Open user menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
            CM
          </div>

          <span className="hidden text-sm font-medium text-text sm:block">
            Christina
          </span>

          <ChevronDown
            size={15}
            className="hidden text-text-muted sm:block"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Mobile navigation placeholder */}
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
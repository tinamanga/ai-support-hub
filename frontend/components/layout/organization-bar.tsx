"use client";

import { Building2 } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import Badge from "@/components/ui/Badge";

export default function OrganizationBar() {
  const { user } = useAuth();

  const organization = user?.organization;
  const role = user?.membership?.role;

  if (!organization) {
    return null;
  }

  const formattedRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : null;

  return (
    <div className="border-b border-border bg-surface">
      <div className="flex min-h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
            <Building2 size={18} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {organization.name}
            </p>

            <p className="text-xs text-text-muted">
              Current organization
            </p>
          </div>

          {formattedRole && (
            <Badge variant="default">
              {formattedRole}
            </Badge>
          )}
        </div>

        <div className="hidden text-xs text-text-muted sm:block">
          Organization workspace
        </div>
      </div>
    </div>
  );
}
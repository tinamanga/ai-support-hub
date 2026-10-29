"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import Badge from "@/components/ui/Badge";
import { getAccessToken } from "@/lib/auth-storage";
import {
  getOrganizationMembers,
  getOrganizations,
} from "@/lib/organizations";
import type {
  Organization,
  OrganizationRole,
} from "@/types/api";

export default function OrganizationBar() {
  const {
    user,
    isAuthenticated,
    activeOrganizationId,
    setActiveOrganizationId,
  } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [role, setRole] = useState<OrganizationRole | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = getAccessToken();

    if (!token) return;

    const accessToken = token;
    let cancelled = false;

    async function loadOrganizations() {
      try {
        const data = await getOrganizations(accessToken);

        if (cancelled) return;

        setOrganizations(data);

        if (data.length === 0) {
          setActiveOrganizationId(null);
          return;
        }

        const activeOrganizationIsValid = data.some(
          (organization) => organization.id === activeOrganizationId,
        );

        if (!activeOrganizationIsValid) {
          const userOrganizationIsValid = data.some(
            (organization) => organization.id === user?.organization?.id,
          );

          setActiveOrganizationId(
            userOrganizationIsValid && user?.organization?.id != null
              ? user.organization.id
              : data[0].id,
          );
        }
      } catch {
        // Keep the authenticated user's organization as a fallback.
      }
    }

    void loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    activeOrganizationId,
    setActiveOrganizationId,
    user?.organization?.id,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedOrganizationRole() {
      setRole(null);

      if (!isAuthenticated || activeOrganizationId === null || !user) {
        return;
      }

      const token = getAccessToken();

      if (!token) return;

      try {
        const members = await getOrganizationMembers(
          token,
          activeOrganizationId,
        );

        if (cancelled) return;

        const membership = members.find(
          (member) => member.user_id === user.id,
        );

        setRole(membership?.role ?? null);
      } catch {
        if (!cancelled) {
          setRole(null);
        }
      }
    }

    void loadSelectedOrganizationRole();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, activeOrganizationId, user]);


  const organization =
    organizations.find(
      (item) => item.id === activeOrganizationId,
    ) ??
    (activeOrganizationId == null ||
    activeOrganizationId === user?.organization?.id
      ? user?.organization
      : null);

  

  if (!organization) {
    return null;
  }

  const formattedRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : null;

  return (
    <div className="border-b border-border bg-surface">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
            <Building2 size={18} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-text-muted">
              Current organization
            </p>

            <label className="sr-only" htmlFor="workspace-organization">
              Select organization
            </label>
            <select
              id="workspace-organization"
              value={activeOrganizationId ?? organization.id}
              onChange={(event) => {
                const value = event.target.value;
                setActiveOrganizationId(value ? Number(value) : null);
              }}
              disabled={organizations.length === 0}
              className="max-w-[min(65vw,24rem)] truncate rounded-md border border-border bg-surface py-1 pr-8 text-sm font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring disabled:opacity-60"
            >
              {organizations.length === 0 ? (
                <option value={organization.id}>{organization.name}</option>
              ) : (
                organizations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {formattedRole && <Badge variant="default">{formattedRole}</Badge>}
        </div>

        <div className="hidden text-xs text-text-muted sm:block">
          Organization workspace
        </div>
      </div>
    </div>
  );
}
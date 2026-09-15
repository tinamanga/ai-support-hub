"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  createOrganization,
  getOrganizations,
} from "@/lib/organizations";
import { getAccessToken } from "@/lib/auth-storage";
import type { Organization } from "@/types/api";

export default function OrganizationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadOrganizations() {
    const token = getAccessToken();

    if (token === null) {
      setOrganizations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getOrganizations(token);
      setOrganizations(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load your organizations.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const token = getAccessToken();

    if (token === null) {
      return;
    }

    const accessToken: string = token;

    let cancelled = false;

    async function fetchOrganizations() {
      try {
        const data = await getOrganizations(accessToken);

        if (cancelled) {
          return;
        }

        setOrganizations(data);
        setError("");
        setIsLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your organizations.",
        );
        setIsLoading(false);
      }
    }

    void fetchOrganizations();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  async function handleCreateOrganization(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = organizationName.trim();

    if (!name) {
      setError("Please enter an organization name.");
      return;
    }

    if (name.length < 2) {
      setError(
        "Organization name must be at least 2 characters.",
      );
      return;
    }

    const token = getAccessToken();

    if (token === null) {
      setError(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    setIsCreating(true);
    setError("");
    setSuccess("");

    try {
      const organization = await createOrganization(token, {
        name,
      });

      setOrganizations((current) => [
        ...current,
        organization,
      ]);

      setOrganizationName("");
      setShowCreateForm(false);
      setSuccess(
        `"${organization.name}" was created successfully.`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create the organization.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  function closeCreateForm() {
    if (isCreating) {
      return;
    }

    setShowCreateForm(false);
    setOrganizationName("");
    setError("");
  }

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              Workspace
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Organizations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Manage the organizations you belong to and create
              new workspaces for your support operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void loadOrganizations()}
              disabled={isLoading}
            >
              <RefreshCw
                size={17}
                className={isLoading ? "animate-spin" : ""}
                aria-hidden="true"
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </Button>

            <Button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowCreateForm(true);
              }}
            >
              <Plus size={17} aria-hidden="true" />
              New organization
            </Button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger"
          >
            <X
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />

            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-lg border border-success/20 bg-success-light px-4 py-3 text-sm text-success"
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />

            <p>{success}</p>
          </div>
        )}

        {showCreateForm && (
          <div className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text">
                  Create organization
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Create a new workspace for your support team.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateForm}
                disabled={isCreating}
                className="rounded-md p-1.5 text-text-muted transition hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close create organization form"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleCreateOrganization}
              className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <Input
                  label="Organization name"
                  name="organization_name"
                  type="text"
                  placeholder="e.g. Acme Support"
                  value={organizationName}
                  onChange={(event) =>
                    setOrganizationName(event.target.value)
                  }
                  disabled={isCreating}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2
                      size={17}
                      className="mr-2 animate-spin"
                      aria-hidden="true"
                    />
                    Creating...
                  </>
                ) : (
                  "Create organization"
                )}
              </Button>
            </form>
          </div>
        )}

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text">
                Your organizations
              </h2>

              {!isLoading && (
                <p className="mt-1 text-sm text-text-muted">
                  {organizations.length}{" "}
                  {organizations.length === 1
                    ? "organization"
                    : "organizations"}
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Loader2
                  size={20}
                  className="animate-spin"
                  aria-hidden="true"
                />

                Loading organizations...
              </div>
            </div>
          ) : organizations.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Building2
                  size={23}
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-text">
                No organizations yet
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                Create your first organization to start
                managing your support workspace.
              </p>

              <Button
                type="button"
                className="mt-5"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowCreateForm(true);
                }}
              >
                <Plus size={17} aria-hidden="true" />
                Create organization
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {organizations.map((organization) => (
                <article
                  key={organization.id}
                  className="rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:border-border-strong hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <Building2
                        size={21}
                        aria-hidden="true"
                      />
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        organization.is_active
                          ? "bg-success-light text-success"
                          : "bg-surface-muted text-text-muted"
                      }`}
                    >
                      {organization.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-text">
                    {organization.name}
                  </h3>

                  <p className="mt-1 text-sm text-text-muted">
                    {organization.slug}
                  </p>

                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-xs text-text-muted">
                      Organization ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-text">
                      #{organization.id}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
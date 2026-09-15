"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  createCustomer,
  getCustomers,
} from "@/lib/customers";

import { getAccessToken } from "@/lib/auth-storage";
import { getOrganizations } from "@/lib/organizations";
import type { Customer, Organization } from "@/types/api";

export default function CustomersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<number | null>(null);

  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] =
    useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const selectedOrganization = useMemo(
    () =>
      organizations.find(
        (organization) =>
          organization.id === selectedOrganizationId,
      ) ?? null,
    [organizations, selectedOrganizationId],
  );

  const canCreateCustomer = user !== null;

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    const accessToken = token;

    let cancelled = false;

    async function fetchOrganizations() {
      try {
        const data = await getOrganizations(accessToken);

        if (cancelled) {
          return;
        }

        setOrganizations(data);

        if (data.length > 0) {
          setSelectedOrganizationId((currentId) => {
            if (
              currentId !== null &&
              data.some(
                (organization) => organization.id === currentId,
              )
            ) {
              return currentId;
            }

            return data[0].id;
          });
        }

        setError("");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load your organizations.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingOrganizations(false);
        }
      }
    }

    void fetchOrganizations();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      selectedOrganizationId === null
    ) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    const accessToken = token;

    let cancelled = false;

    async function fetchCustomers() {
      setIsLoadingCustomers(true);
      setError("");

      try {
        const data = await getCustomers(
          accessToken,
          selectedOrganizationId as number,
        );

        if (cancelled) {
          return;
        }

        setCustomers(data);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setCustomers([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load customers.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingCustomers(false);
        }
      }
    }

    void fetchCustomers();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    selectedOrganizationId,
  ]);

  async function loadCustomers() {
    if (selectedOrganizationId === null) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    setIsLoadingCustomers(true);
    setError("");
    setSuccess("");

    try {
      const data = await getCustomers(
        token,
        selectedOrganizationId,
      );

      setCustomers(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load customers.",
      );
    } finally {
      setIsLoadingCustomers(false);
    }
  }

  async function handleCreateCustomer(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (selectedOrganizationId === null) {
      setError("Please select an organization first.");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (!fullName.trim()) {
      setError("Customer name is required.");
      return;
    }

    setIsCreating(true);
    setError("");
    setSuccess("");

    try {
      const customer = await createCustomer(
        token,
        selectedOrganizationId,
        {
          full_name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
        },
      );

      setCustomers((currentCustomers) => [
        customer,
        ...currentCustomers,
      ]);

      setFullName("");
      setEmail("");
      setPhone("");
      setShowCreateForm(false);
      setSuccess("Customer created successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create customer.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.full_name
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        customer.phone
          ?.toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [customers, searchTerm]);

  if (authLoading || isLoadingOrganizations) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="text-sm text-text-muted">
          Loading your customers workspace...
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
            <Building2 size={22} />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-text">
            No organizations found
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
            Create or join an organization before adding
            customers to your support workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users
                size={22}
                className="text-primary"
              />
              <h1 className="text-2xl font-semibold text-text">
                Customers
              </h1>
            </div>

            <p className="mt-1 text-sm text-text-secondary">
              Manage customers connected to your support
              workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedOrganizationId ?? ""}
              onChange={(event) => {
                setSelectedOrganizationId(
                  Number(event.target.value),
                );
                setSuccess("");
                setError("");
              }}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring"
              aria-label="Select organization"
            >
              {organizations.map((organization) => (
                <option
                  key={organization.id}
                  value={organization.id}
                >
                  {organization.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void loadCustomers()}
              disabled={isLoadingCustomers}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-text transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  isLoadingCustomers
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            {canCreateCustomer && (
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(true);
                  setError("");
                  setSuccess("");
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover"
              >
                <Plus size={17} />
                New Customer
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-success/20 bg-success-light px-4 py-3 text-sm text-success">
            {success}
          </div>
        )}

        {showCreateForm && canCreateCustomer && (
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text">
                  Add customer
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Add a customer to{" "}
                  <span className="font-medium text-text">
                    {selectedOrganization?.name}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-md p-2 text-text-muted transition hover:bg-surface-muted hover:text-text"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreateCustomer}
              className="grid gap-4 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="customer-name"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Full name
                </label>

                <input
                  id="customer-name"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Jane Doe"
                  required
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-focus-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="customer-email"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Email
                </label>

                <input
                  id="customer-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="jane@example.com"
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-focus-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="customer-phone"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Phone
                </label>

                <input
                  id="customer-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+254 700 000 000"
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-focus-ring"
                />
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="h-10 flex-1 rounded-md border border-border bg-surface px-4 text-sm font-medium text-text transition hover:bg-surface-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus size={16} />
                  {isCreating
                    ? "Creating..."
                    : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-text">
                Customer directory
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                {customers.length}{" "}
                {customers.length === 1
                  ? "customer"
                  : "customers"}{" "}
                in this organization
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search customers..."
                className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-focus-ring"
              />
            </div>
          </div>

          {isLoadingCustomers ? (
            <div className="flex min-h-56 items-center justify-center p-6">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
                Loading customers...
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                <Users size={22} />
              </div>

              <h3 className="mt-4 font-medium text-text">
                {searchTerm
                  ? "No customers found"
                  : "No customers yet"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-text-secondary">
                {searchTerm
                  ? "Try a different name, email, or phone number."
                  : "Add your first customer to start building your support directory."}
              </p>

              {!searchTerm && canCreateCustomer && (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
                >
                  <Plus size={16} />
                  Add Customer
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-surface-muted/50 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary">
                      {customer.full_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-text">
                        {customer.full_name}
                      </h3>

                      <div className="mt-1 flex flex-col gap-1 text-xs text-text-secondary sm:flex-row sm:items-center sm:gap-4">
                        {customer.email && (
                          <span className="inline-flex items-center gap-1.5">
                            <Mail size={13} />
                            {customer.email}
                          </span>
                        )}

                        {customer.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone size={13} />
                            {customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-text-muted md:text-right">
                    Customer #{customer.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
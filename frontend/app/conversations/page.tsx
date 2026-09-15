
"use client";

// Importing icons for navigation, actions, statuses, and conversation controls.
import {
  AlertCircle,
  ChevronDown,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";

// Importing React hooks for managing state, effects, and derived data.
import { useEffect, useMemo, useState } from "react";

// Importing Next.js routing for opening conversation details.
import { useRouter } from "next/navigation";

// Importing authentication and API utilities.
import { useAuth } from "@/components/auth/AuthProvider";
import { getAccessToken } from "@/lib/auth-storage";

// Importing conversation API functions.
import {
  createConversation,
  getConversations,
  updateConversationPriority,
  updateConversationStatus,
} from "@/lib/conversations";

// Importing customer and organization API functions.
import { getCustomers } from "@/lib/customers";
import {
  getOrganizationMembers,
  getOrganizations,
} from "@/lib/organizations";

// Importing shared application types.
import type {
  Conversation,
  ConversationPriority,
  ConversationStatus,
  Customer,
  Organization,
  OrganizationMember,
} from "@/types/api";

// Defining the available conversation priorities.
const PRIORITIES: ConversationPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

// Defining the available conversation statuses.
const STATUSES: ConversationStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
];

// Formatting conversation dates for readable display.
function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// Applying visual styling based on the conversation priority.
function getPriorityClasses(
  priority: ConversationPriority,
): string {
  switch (priority) {
    case "urgent":
      return "bg-red-50 text-red-700";
    case "high":
      return "bg-orange-50 text-orange-700";
    case "medium":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// Applying visual styling based on the conversation status.
function getStatusClasses(status: ConversationStatus): string {
  switch (status) {
    case "open":
      return "bg-blue-50 text-blue-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "resolved":
      return "bg-green-50 text-green-700";
    case "closed":
      return "bg-slate-100 text-slate-600";
  }
}

// Resolving and displaying the customer name for a conversation.
function getCustomerName(
  customerId: number | null,
  customers: Customer[],
): string {
  if (customerId === null) {
    return "Unknown customer";
  }

  return (
    customers.find((customer) => customer.id === customerId)
      ?.full_name ?? `Customer #${customerId}`
  );
}

// Resolving and displaying the assigned agent for a conversation.
function getAgentName(
  agentId: number | null,
  members: OrganizationMember[],
): string {
  if (agentId === null) {
    return "Unassigned";
  }

  const agent = members.find(
    (member) => member.user_id === agentId,
  );

  return agent ? `Agent #${agent.user_id}` : `Agent #${agentId}`;
}

// Rendering the conversations management page.
export default function ConversationsPage() {
  // Reading the authenticated user and authentication state.
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  // Creating the router for navigating to conversation details.
  const router = useRouter();

  // Storing the organizations available to the current user.
  const [organizations, setOrganizations] = useState<
    Organization[]
  >([]);

  // Tracking the currently selected organization.
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<number | null>(null);

  // Storing conversations belonging to the selected organization.
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  // Storing customers belonging to the selected organization.
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Storing organization membership records.
  const [members, setMembers] = useState<OrganizationMember[]>([]);

  // Tracking organization loading state.
  const [isLoadingOrganizations, setIsLoadingOrganizations] =
    useState(true);

  // Tracking conversation loading state.
  const [isLoadingConversations, setIsLoadingConversations] =
    useState(false);

  // Tracking customer loading state.
  const [isLoadingCustomers, setIsLoadingCustomers] =
    useState(false);

  // Storing API and UI errors.
  const [error, setError] = useState("");

  // Tracking the current conversation search query.
  const [search, setSearch] = useState("");

  // Tracking whether the create conversation dialog is opening.
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Tracking the conversation creation request.
  const [isCreating, setIsCreating] = useState(false);

  // Tracking the selected customer for a new conversation.
  const [customerId, setCustomerId] = useState("");

  // Tracking the subject for a new conversation.
  const [subject, setSubject] = useState("");

  // Tracking the priority for a new conversation.
  const [priority, setPriority] =
    useState<ConversationPriority>("medium");

  // Tracking the conversation currently being updated.
  const [updatingConversationId, setUpdatingConversationId] =
    useState<number | null>(null);

  // Resolving the currently selected organization.
  const selectedOrganization = organizations.find(
    (organization) =>
      organization.id === selectedOrganizationId,
  );

  // Resolving the current user's membership in the selected organization.
  const currentMembership = members.find(
    (member) => member.user_id === user?.id,
  );

  // Checking whether the current user is managing conversations.
  const canManageConversations =
    currentMembership?.role === "owner" ||
    currentMembership?.role === "admin";

  // Loading organizations after authentication is becoming available.
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

        // Selecting the current organization or the first available organization.
        if (data.length > 0) {
          setSelectedOrganizationId((current) =>
            current &&
            data.some(
              (organization) => organization.id === current,
            )
              ? current
              : data[0].id,
          );
        }

        setError("");
        setIsLoadingOrganizations(false);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load your organizations.",
        );
        setIsLoadingOrganizations(false);
      }
    }

    void fetchOrganizations();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  // Loading conversations, customers, and members for the selected organization.
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

    async function fetchOrganizationData() {
      const organizationId = selectedOrganizationId;

      if (organizationId === null) {
        return;
      }

      setIsLoadingConversations(true);
      setIsLoadingCustomers(true);

      try {
        const [
          conversationData,
          customerData,
          memberData,
        ] = await Promise.all([
          getConversations(
            accessToken,
            organizationId,
          ),
          getCustomers(
            accessToken,
            organizationId,
          ),
          getOrganizationMembers(
            accessToken,
            organizationId,
          ),
        ]);

        if (cancelled) {
          return;
        }

        setConversations(conversationData);
        setCustomers(customerData);
        setMembers(memberData);
        setError("");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load conversations.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingConversations(false);
          setIsLoadingCustomers(false);
        }
      }
    }

    void fetchOrganizationData();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    selectedOrganizationId,
  ]);

  // Filtering conversations according to the current search query.
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const customerName = getCustomerName(
        conversation.customer_id,
        customers,
      ).toLowerCase();

      const conversationSubject =
        conversation.subject?.toLowerCase() ?? "";

      const status = conversation.status.toLowerCase();
      const priorityValue =
        conversation.priority.toLowerCase();

      return (
        customerName.includes(query) ||
        conversationSubject.includes(query) ||
        status.includes(query) ||
        priorityValue.includes(query) ||
        conversation.id.toString().includes(query)
      );
    });
  }, [conversations, customers, search]);

  // Refreshing conversations for the selected organization.
  async function refreshConversations() {
    if (selectedOrganizationId === null) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    setIsLoadingConversations(true);
    setError("");

    try {
      const data = await getConversations(
        token,
        selectedOrganizationId,
      );

      setConversations(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to refresh conversations.",
      );
    } finally {
      setIsLoadingConversations(false);
    }
  }

  // Creating a new conversation for the selected customer.
  async function handleCreateConversation(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (selectedOrganizationId === null || !customerId) {
      setError("Please select a customer.");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const conversation = await createConversation(
        token,
        selectedOrganizationId,
        {
          customer_id: Number(customerId),
          subject: subject.trim() || null,
          priority,
        },
      );

      setConversations((current) => [
        conversation,
        ...current,
      ]);

      setCustomerId("");
      setSubject("");
      setPriority("medium");
      setIsCreateOpen(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create conversation.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  // Updating the priority of an existing conversation.
  async function handlePriorityChange(
    conversationId: number,
    nextPriority: ConversationPriority,
  ) {
    if (
      selectedOrganizationId === null ||
      !canManageConversations
    ) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    setUpdatingConversationId(conversationId);
    setError("");

    try {
      const updated = await updateConversationPriority(
        token,
        selectedOrganizationId,
        conversationId,
        nextPriority,
      );

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === updated.id
            ? updated
            : conversation,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update priority.",
      );
    } finally {
      setUpdatingConversationId(null);
    }
  }

  // Updating the status of an existing conversation.
  async function handleStatusChange(
    conversationId: number,
    nextStatus: ConversationStatus,
  ) {
    if (
      selectedOrganizationId === null ||
      !canManageConversations
    ) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    setUpdatingConversationId(conversationId);
    setError("");

    try {
      const updated = await updateConversationStatus(
        token,
        selectedOrganizationId,
        conversationId,
        nextStatus,
      );

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === updated.id
            ? updated
            : conversation,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update status.",
      );
    } finally {
      setUpdatingConversationId(null);
    }
  }

  // Opening the conversation detail page while preserving the selected organization.
  function openConversation(conversationId: number) {
    if (selectedOrganizationId === null) {
      return;
    }

    router.push(
      `/conversations/${conversationId}?organizationId=${selectedOrganizationId}`,
    );
  }

  // Displaying a loading state while authentication and organizations are loading.
  if (authLoading || isLoadingOrganizations) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading conversations...
        </div>
      </div>
    );
  }

  // Preventing unauthenticated users from accessing the page.
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Displaying the conversations page header and organization controls. */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>

              <span className="text-sm font-medium text-primary">
                Customer Support
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Conversations
            </h1>

            <p className="mt-1 text-sm text-text-muted">
              Manage customer conversations across your
              organization.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <select
                value={selectedOrganizationId ?? ""}
                onChange={(event) =>
                  setSelectedOrganizationId(
                    event.target.value
                      ? Number(event.target.value)
                      : null,
                  )
                }
                className="h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 pr-9 text-sm font-medium text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-focus-ring sm:w-56"
              >
                {organizations.length === 0 ? (
                  <option value="">
                    No organizations
                  </option>
                ) : (
                  organizations.map((organization) => (
                    <option
                      key={organization.id}
                      value={organization.id}
                    >
                      {organization.name}
                    </option>
                  ))
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              disabled={
                selectedOrganizationId === null ||
                customers.length === 0
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              New Conversation
            </button>
          </div>
        </div>

        {/* Displaying API errors when requests are failing. */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Displaying conversation summary metrics. */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total"
            value={conversations.length}
            icon={
              <MessageSquare className="h-5 w-5" />
            }
          />

          <SummaryCard
            label="Open"
            value={
              conversations.filter(
                (conversation) =>
                  conversation.status === "open",
              ).length
            }
            icon={
              <MessageSquare className="h-5 w-5" />
            }
          />

          <SummaryCard
            label="Urgent"
            value={
              conversations.filter(
                (conversation) =>
                  conversation.priority === "urgent",
              ).length
            }
            icon={
              <AlertCircle className="h-5 w-5" />
            }
          />
        </div>

        {/* Displaying the conversation list and search controls. */}
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-text">
                All Conversations
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                {selectedOrganization?.name ??
                  "Select an organization"}
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search conversations..."
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-focus-ring"
                />
              </div>

              <button
                type="button"
                onClick={() => void refreshConversations()}
                disabled={isLoadingConversations}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Refresh conversations"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isLoadingConversations
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Displaying loading, empty, or conversation results states. */}
          {isLoadingConversations ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading conversations...
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                <MessageSquare className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-text">
                {search
                  ? "No conversations found"
                  : "No conversations yet"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-text-muted">
                {search
                  ? "Try adjusting your search."
                  : "Create your first customer conversation to get started."}
              </p>

              {!search && customers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  <Plus className="h-4 w-4" />
                  New Conversation
                </button>
              )}

              {!search && customers.length === 0 && (
                <p className="mt-4 text-xs text-text-muted">
                  Add a customer before creating a
                  conversation.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map(
                (conversation) => (
                  <article
                    key={conversation.id}
                    onClick={() =>
                      openConversation(conversation.id)
                    }
                    className="cursor-pointer p-4 transition hover:bg-background/60 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-text-muted">
                            #{conversation.id}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                              conversation.status,
                            )}`}
                          >
                            {conversation.status}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityClasses(
                              conversation.priority,
                            )}`}
                          >
                            {conversation.priority}
                          </span>
                        </div>

                        <h3 className="mt-3 truncate font-semibold text-text">
                          {conversation.subject ||
                            "No subject"}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="h-3.5 w-3.5" />
                            {getCustomerName(
                              conversation.customer_id,
                              customers,
                            )}
                          </span>

                          <span>
                            Created{" "}
                            {formatDate(
                              conversation.created_at,
                            )}
                          </span>

                          <span>
                            {getAgentName(
                              conversation.assigned_agent_id,
                              members,
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Keeping status and priority controls independent from detail navigation. */}
                      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
                        {canManageConversations ? (
                          <>
                            <select
                              value={conversation.status}
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                              onChange={(event) =>
                                void handleStatusChange(
                                  conversation.id,
                                  event.target
                                    .value as ConversationStatus,
                                )
                              }
                              disabled={
                                updatingConversationId ===
                                conversation.id
                              }
                              className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium capitalize text-text outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring"
                              aria-label={`Status for conversation ${conversation.id}`}
                            >
                              {STATUSES.map((item) => (
                                <option
                                  key={item}
                                  value={item}
                                >
                                  {item}
                                </option>
                              ))}
                            </select>

                            <select
                              value={conversation.priority}
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                              onChange={(event) =>
                                void handlePriorityChange(
                                  conversation.id,
                                  event.target
                                    .value as ConversationPriority,
                                )
                              }
                              disabled={
                                updatingConversationId ===
                                conversation.id
                              }
                              className="h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium capitalize text-text outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring"
                              aria-label={`Priority for conversation ${conversation.id}`}
                            >
                              {PRIORITIES.map((item) => (
                                <option
                                  key={item}
                                  value={item}
                                >
                                  {item}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : (
                          <span className="text-xs text-text-muted">
                            Agent view
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {/* Displaying the create conversation modal. */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-text">
                  New Conversation
                </h2>

                <p className="mt-1 text-xs text-text-muted">
                  Create a conversation for a customer.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsCreateOpen(false)
                }
                className="rounded-lg p-2 text-text-muted transition hover:bg-surface-muted hover:text-text"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Collecting the customer, subject, and priority for the new conversation. */}
            <form
              onSubmit={handleCreateConversation}
              className="space-y-5 p-5"
            >
              <div>
                <label
                  htmlFor="conversation-customer"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Customer
                </label>

                <select
                  id="conversation-customer"
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(event.target.value)
                  }
                  required
                  disabled={isLoadingCustomers}
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring"
                >
                  <option value="">
                    {isLoadingCustomers
                      ? "Loading customers..."
                      : "Select a customer"}
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.full_name}
                      {customer.email
                        ? ` — ${customer.email}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="conversation-subject"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Subject
                </label>

                <input
                  id="conversation-subject"
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  placeholder="What does the customer need help with?"
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-focus-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="conversation-priority"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Priority
                </label>

                <select
                  id="conversation-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as ConversationPriority,
                    )
                  }
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm capitalize text-text outline-none focus:border-primary focus:ring-2 focus:ring-focus-ring"
                >
                  {PRIORITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setIsCreateOpen(false)
                  }
                  className="h-11 rounded-lg border border-border px-4 text-sm font-semibold text-text-secondary transition hover:bg-surface-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating || !customerId}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Create Conversation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Rendering a reusable summary metric card.
function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">
          {label}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-text">
        {value}
      </p>
    </div>
  );
}


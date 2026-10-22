"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Users,
  Building2,
  Plus,
  AlertTriangle,
  Inbox,
  Loader2,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDashboardOverview } from "@/lib/dashboard";
import { getAccessToken } from "@/lib/auth-storage";
import type { DashboardOverview } from "@/lib/dashboard";
import type { Conversation } from "@/types/api";

const quickActions = [
  {
    title: "Start a conversation",
    description: "Open a new customer support conversation.",
    href: "/conversations",
    icon: MessageSquare,
  },
  {
    title: "Manage customers",
    description: "View and manage your customer records.",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Organizations",
    description: "Manage your organizations and members.",
    href: "/organizations",
    icon: Building2,
  },
];

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatusVariant(
  status: Conversation["status"],
): "default" | "success" | "warning" | "danger" {
  switch (status) {
    case "resolved":
      return "success";
    case "pending":
      return "warning";
    case "closed":
      return "default";
    case "open":
    default:
      return "danger";
  }
}

function getPriorityVariant(
  priority: Conversation["priority"],
): "default" | "success" | "warning" | "danger" {
  switch (priority) {
    case "urgent":
      return "danger";
    case "high":
      return "warning";
    case "low":
      return "success";
    case "medium":
    default:
      return "default";
  }
}

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function DashboardPage() {
  const { user, activeOrganizationId } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const organizationId =
    activeOrganizationId ?? user?.organization?.id;

  const loadDashboard = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }
  
    const token = getAccessToken();
  
    if (!token) {
      setError("Your session has expired. Please log in again.");
      setIsLoading(false);
      return;
    }
  
    try {
      setIsLoading(true);
      setError(null);
  
      const data = await getDashboardOverview(
        token,
        organizationId,
      );
  
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    // Load dashboard data after the component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  const summary = dashboard?.conversations;

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              {dashboard?.organization.name ?? "Overview"}
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              Monitor your support workspace and manage customer
              conversations from one place.
            </p>
          </div>

          <Link href="/conversations">
            <Button>
              <Plus size={17} className="mr-2" aria-hidden="true" />
              New Conversation
            </Button>
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <Card className="mt-6">
            <div className="flex min-h-32 items-center justify-center gap-3 p-6">
              <Loader2
                size={20}
                className="animate-spin text-primary"
                aria-hidden="true"
              />
              <p className="text-sm text-text-secondary">
                Loading dashboard...
              </p>
            </div>
          </Card>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <Card className="mt-6">
            <div className="flex items-start gap-3 p-6">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-danger"
                aria-hidden="true"
              />

              <div>
                <h2 className="text-sm font-semibold text-text">
                  Unable to load dashboard
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadDashboard}
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Try again
                </button>
              </div>
            </div>
          </Card>
        )}

        {!isLoading && !error && dashboard && (
          <>
            {/* AI introduction */}
            <Card className="mt-6 overflow-hidden">
              <div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary-light text-secondary">
                    <Bot size={23} aria-hidden="true" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-text">
                        AI Support Assistant
                      </h2>

                      <Badge variant="success">Ready</Badge>
                    </div>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                      AI Support Hub brings customer conversations,
                      support workflows, and business assistance into a
                      single workspace.
                    </p>
                  </div>
                </div>

                <Button variant="outline">
                  Explore Assistant
                  <ArrowRight
                    size={16}
                    className="ml-2"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </Card>

            {/* Workspace metrics */}
            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-text">
                  Workspace Overview
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  A real-time summary of your support workspace.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                        <Users size={19} aria-hidden="true" />
                      </div>

                      <span className="text-xs font-medium text-text-muted">
                        Customers
                      </span>
                    </div>

                    <p className="mt-5 text-2xl font-bold text-text">
                      {dashboard.total_customers}
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                      Total customers
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                        <MessageSquare
                          size={19}
                          aria-hidden="true"
                        />
                      </div>

                      <span className="text-xs font-medium text-text-muted">
                        Conversations
                      </span>
                    </div>

                    <p className="mt-5 text-2xl font-bold text-text">
                      {summary?.total ?? 0}
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                      Total conversations
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                        <Clock3 size={19} aria-hidden="true" />
                      </div>

                      <span className="text-xs font-medium text-text-muted">
                        Pending
                      </span>
                    </div>

                    <p className="mt-5 text-2xl font-bold text-text">
                      {summary?.pending ?? 0}
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                      Awaiting action
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                        <CheckCircle2
                          size={19}
                          aria-hidden="true"
                        />
                      </div>

                      <span className="text-xs font-medium text-text-muted">
                        Resolved
                      </span>
                    </div>

                    <p className="mt-5 text-2xl font-bold text-text">
                      {summary?.resolved ?? 0}
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                      Resolved conversations
                    </p>
                  </div>
                </Card>
              </div>
            </section>

            {/* Conversation summary */}
            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-text">
                  Conversation Status
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  Current workload across your support workspace.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <div className="p-5">
                    <p className="text-sm text-text-muted">Open</p>
                    <p className="mt-2 text-xl font-bold text-text">
                      {summary?.open ?? 0}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-5">
                    <p className="text-sm text-text-muted">Pending</p>
                    <p className="mt-2 text-xl font-bold text-text">
                      {summary?.pending ?? 0}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-5">
                    <p className="text-sm text-text-muted">Assigned</p>
                    <p className="mt-2 text-xl font-bold text-text">
                      {summary?.assigned ?? 0}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-5">
                    <p className="text-sm text-text-muted">Unassigned</p>
                    <p className="mt-2 text-xl font-bold text-text">
                      {summary?.unassigned ?? 0}
                    </p>
                  </div>
                </Card>
              </div>
            </section>

            {/* Quick actions */}
            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-text">
                  Workspace
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  Access the main areas of your support workspace.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Card
                      key={action.title}
                      className="group transition-shadow hover:shadow-md"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                            <Icon size={19} aria-hidden="true" />
                          </div>

                          <ArrowRight
                            size={17}
                            className="text-text-muted transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </div>

                        <h3 className="mt-5 text-sm font-semibold text-text">
                          {action.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                          {action.description}
                        </p>

                        <Link
                          href={action.href}
                          className="mt-4 inline-flex text-sm font-medium text-primary hover:text-primary-hover"
                        >
                          Open
                          <ArrowRight
                            size={15}
                            className="ml-1.5"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Recent conversations */}
            <section className="mt-8">
              <Card>
                <div className="p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-text">
                        Recent Conversations
                      </h2>

                      <p className="mt-1 text-sm text-text-muted">
                        Your latest customer conversations.
                      </p>
                    </div>

                    <Link
                      href="/conversations"
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      View all
                      <ArrowRight
                        size={15}
                        className="ml-1.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>

                  {dashboard.recent_conversations.length === 0 ? (
                    <div className="mt-6 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-muted/40 px-6">
                      <div className="text-center">
                        <Inbox
                          size={24}
                          className="mx-auto text-text-muted"
                          aria-hidden="true"
                        />

                        <p className="mt-3 text-sm font-medium text-text-secondary">
                          No conversations yet
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          Start a conversation to see activity here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 divide-y divide-border rounded-lg border border-border">
                      {dashboard.recent_conversations.map(
                        (conversation) => (
                          <Link
                            key={conversation.id}
                            href={`/conversations/${conversation.id}?organizationId=${dashboard.organization.id}`}
                            className="block p-4 transition-colors hover:bg-surface-muted"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-text">
                                  {conversation.subject ||
                                    `Conversation #${conversation.id}`}
                                </p>

                                <p className="mt-1 text-xs text-text-muted">
                                  Updated{" "}
                                  {formatDate(conversation.updated_at)}
                                </p>
                              </div>

                              <div className="flex shrink-0 flex-wrap gap-2">
                                <Badge
                                  variant={getStatusVariant(
                                    conversation.status,
                                  )}
                                >
                                  {formatLabel(conversation.status)}
                                </Badge>

                                <Badge
                                  variant={getPriorityVariant(
                                    conversation.priority,
                                  )}
                                >
                                  {formatLabel(
                                    conversation.priority,
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
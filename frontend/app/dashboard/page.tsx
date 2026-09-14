import Link from "next/link";
import {
    ArrowRight,
    Bot,
    MessageSquare,
    Users,
    Building2,
    Plus,
  } from "lucide-react";
  
  import Card from "@/components/ui/Card";
  import Button from "@/components/ui/Button";
  import Badge from "@/components/ui/Badge";
  
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
  
  export default function DashboardPage() {
    return (
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Overview
              </p>
  
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl">
                Dashboard
              </h1>
  
              <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                Monitor your support workspace and manage customer
                conversations from one place.
              </p>
            </div>
  
            <Button>
              <Plus size={17} className="mr-2" aria-hidden="true" />
              New Conversation
            </Button>
          </div>
  
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
  
          {/* Workspace overview */}
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
  
          {/* Activity placeholder */}
          <section className="mt-8">
            <Card>
              <div className="p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-text">
                      Recent Activity
                    </h2>
  
                    <p className="mt-1 text-sm text-text-muted">
                      Your latest support activity will appear here.
                    </p>
                  </div>
  
                  <Badge>Coming soon</Badge>
                </div>
  
                <div className="mt-6 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-muted/40 px-6">
                  <div className="text-center">
                    <MessageSquare
                      size={24}
                      className="mx-auto text-text-muted"
                      aria-hidden="true"
                    />
  
                    <p className="mt-3 text-sm font-medium text-text-secondary">
                      No activity to display yet
                    </p>
  
                    <p className="mt-1 text-xs text-text-muted">
                      Activity will be connected to the backend in a
                      later milestone.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    );
  }
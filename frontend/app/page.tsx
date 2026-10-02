import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Customer Conversations",
    description:
      "Manage customer conversations from a centralized workspace with status, priority, messages, and assignment controls.",
  },
  {
    icon: Users,
    title: "Agent Management",
    description:
      "Organize your support team and assign conversations to the right agents within your organization.",
  },
  {
    icon: Bot,
    title: "AI Support Workflows",
    description:
      "Build toward intelligent support workflows that help teams handle customer requests more efficiently.",
  },
  {
    icon: ShieldCheck,
    title: "Organization Security",
    description:
      "Keep organizations isolated with authenticated access, memberships, roles, and organization-level authorization.",
  },
];

const capabilities = [
  "Customer management",
  "Conversation management",
  "Agent assignment",
  "Message handling",
  "Status and priority tracking",
  "Organization roles and permissions",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-text">
      {/* Navigation */}
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <Bot className="h-5 w-5" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              AI Support Hub
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-muted hover:text-text"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary-light bg-primary-light px-3 py-1.5 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Customer support platform
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl">
              Customer support, organized in one place.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              AI Support Hub gives support teams one workspace for managing
              customers, conversations, agents, messages, and organization
              access.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-md transition hover:bg-primary-hover"
              >
                Create your workspace
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold text-text transition hover:bg-surface-muted"
              >
                Sign in to your workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              One support workspace
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Everything your support team needs to manage conversations.
            </h2>

            <p className="mt-5 leading-7 text-text-secondary">
              AI Support Hub connects the core parts of your support workflow.
              Customers, conversations, agents, messages, organizations, and
              permissions work together through the platform&apos;s authenticated
              API.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {capabilities.map((capability) => (
                <div
                  key={capability}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />

                  <span className="text-sm font-medium text-text">
                    {capability}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
              >
                Get started with AI Support Hub
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Real Product Structure */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-lg">
            <div className="border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <Bot className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold text-text">
                    AI Support Hub
                  </p>

                  <p className="text-sm text-text-muted">
                    Support workspace
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />

                  <div>
                    <p className="text-sm font-semibold text-text">
                      Conversations
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      View and manage customer conversations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-secondary" />

                  <div>
                    <p className="text-sm font-semibold text-text">
                      Customers & agents
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      Manage customers and support team assignments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-success" />

                  <div>
                    <p className="text-sm font-semibold text-text">
                      Organization access
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      Roles and organization-level authorization.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-primary-light px-4 py-3">
              <p className="text-sm font-medium text-primary">
                Your actual workspace data appears after authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Built into the platform
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Support workflows that work together
            </h2>

            <p className="mt-4 text-text-secondary">
              The platform is designed around the actual support operations
              your team performs every day.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 font-semibold text-text">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Authentication CTA */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Bot className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Ready to manage your support workspace?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            Create an organization and start using the support workspace with
            your real customers, conversations, agents, and messages.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-md transition hover:bg-primary-hover"
            >
              Create an account
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold text-text transition hover:bg-surface-muted"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="font-medium text-text">
              AI Support Hub
            </span>
          </div>

          <p>Customer support, organized.</p>
        </div>
      </footer>
    </main>
  );
}
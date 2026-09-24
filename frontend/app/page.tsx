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
    title: "Manage Conversations",
    description:
      "Keep customer conversations organized and give support agents a clear place to respond.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Assign conversations to agents and manage support responsibilities across your organization.",
  },
  {
    icon: Bot,
    title: "AI-Powered Support",
    description:
      "Build a foundation for intelligent support workflows and AI-assisted customer service.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "Organization-based access control helps keep customer and support data isolated.",
  },
];

const highlights = [
  "Centralized customer conversations",
  "Agent assignment and management",
  "Conversation status and priority tracking",
  "Organization-based access control",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Bot className="h-5 w-5" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              AI Support Hub
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Modern customer support
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              A smarter way to manage customer support.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              AI Support Hub brings customers, conversations, agents, and
              intelligent support workflows together in one centralized
              platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Start supporting customers
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 px-6 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-2 text-sm text-slate-400"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product preview */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-blue-950/40">
              <div className="rounded-xl border border-white/10 bg-slate-900">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-600" />
                    <div className="h-3 w-3 rounded-full bg-slate-600" />
                    <div className="h-3 w-3 rounded-full bg-slate-600" />
                  </div>

                  <span className="text-xs text-slate-500">
                    Support Dashboard
                  </span>

                  <div className="w-12" />
                </div>

                {/* Dashboard preview */}
                <div className="grid gap-4 p-5 sm:grid-cols-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">Customers</p>
                    <p className="mt-2 text-2xl font-semibold">1,248</p>
                    <p className="mt-1 text-xs text-emerald-400">
                      Active customers
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">Conversations</p>
                    <p className="mt-2 text-2xl font-semibold">326</p>
                    <p className="mt-1 text-xs text-blue-400">
                      Support activity
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">Open</p>
                    <p className="mt-2 text-2xl font-semibold">84</p>
                    <p className="mt-1 text-xs text-amber-400">
                      Needs attention
                    </p>
                  </div>
                </div>

                <div className="space-y-3 px-5 pb-5">
                  {[
                    {
                      name: "Jane Wanjiku",
                      subject: "Payment inquiry",
                      status: "Open",
                    },
                    {
                      name: "Michael Otieno",
                      subject: "Account assistance",
                      status: "Pending",
                    },
                    {
                      name: "Sarah Kimani",
                      subject: "Subscription question",
                      status: "Resolved",
                    },
                  ].map((conversation) => (
                    <div
                      key={conversation.name}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-300">
                          {conversation.name
                            .split(" ")
                            .map((name) => name[0])
                            .join("")}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-200">
                            {conversation.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {conversation.subject}
                          </p>
                        </div>
                      </div>

                      <span className="ml-3 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                        {conversation.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Everything in one place
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Built for modern support teams
            </h2>

            <p className="mt-4 text-slate-400">
              Manage the complete support workflow while keeping your
              organization, customers, and agents connected.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-400/30 hover:bg-white/[0.05]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to bring your support workflow together?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Create your organization, invite your support team, and start
            managing customer conversations from one place.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Create your support workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-400" />
            <span>AI Support Hub</span>
          </div>

          <p>Customer support, organized.</p>
        </div>
      </footer>
    </main>
  );
}
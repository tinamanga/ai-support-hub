"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { login } from "@/lib/auth";
import { setAccessToken } from "@/lib/auth-storage";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
      });

      setAccessToken(response.access_token);

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <section className="hidden w-1/2 flex-col justify-between bg-primary p-10 text-white lg:flex">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-primary">
              AI
            </div>

            <div>
              <p className="text-sm font-bold">
                Support Hub
              </p>

              <p className="text-xs text-white/70">
                Business Support Platform
              </p>
            </div>
          </Link>
        </div>

        <div className="max-w-lg">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <LockKeyhole size={24} aria-hidden="true" />
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Support your customers smarter.
          </h1>

          <p className="mt-5 text-base leading-7 text-white/80">
            Manage customers, conversations, organizations,
            and AI-powered support workflows from one
            centralized workspace.
          </p>
        </div>

        <p className="text-xs text-white/60">
          AI Support Hub
        </p>
      </section>

      {/* Login panel */}
      <section className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-10 lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                AI
              </div>

              <div>
                <p className="text-sm font-bold text-text">
                  Support Hub
                </p>

                <p className="text-xs text-text-muted">
                  Business Support Platform
                </p>
              </div>
            </Link>
          </div>

          <div>
            <p className="text-sm font-medium text-primary">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text">
              Sign in to your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Enter your credentials to access your support
              workspace.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-md border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div className="relative">
              <Input
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={isLoading}
                required
              />

              <Mail
                size={17}
                className="pointer-events-none absolute right-3 top-[38px] text-text-muted"
                aria-hidden="true"
              />
            </div>

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={isLoading}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="absolute right-3 top-[35px] rounded-md p-1 text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="mr-2 animate-spin"
                    aria-hidden="true"
                  />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import OrganizationBar from "@/components/layout/organization-bar";
import AppFooter from "@/components/layout/app-footer";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-muted">
          Loading your workspace...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopNav />
        <OrganizationBar />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>

        <AppFooter />
      </div>
    </div>
  );
}

import WorkspaceLayout from "@/components/layout/WorkspaceLayout";

export default function RouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}

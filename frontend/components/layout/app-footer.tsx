export default function AppFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="flex min-h-12 flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-text-muted sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} AI Support Hub
        </p>

        <div className="flex items-center gap-4">
          <span>Support Workspace</span>
          <span>•</span>
          <span>Secure &amp; authenticated</span>
        </div>
      </div>
    </footer>
  );
}
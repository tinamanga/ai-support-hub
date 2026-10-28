"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { getAccessToken } from "@/lib/auth-storage";
import {
  createKnowledgeEntry,
  deleteKnowledgeEntry,
  getKnowledgeEntries,
  updateKnowledgeEntry,
} from "@/lib/knowledge";
import { getOrganizations } from "@/lib/organizations";
import type { KnowledgeEntry, Organization } from "@/types/api";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

interface EntryForm {
  title: string;
  content: string;
  category: string;
  is_published: boolean;
}

const emptyForm: EntryForm = {
  title: "",
  content: "",
  category: "",
  is_published: false,
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function KnowledgePage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    activeOrganizationId,
    setActiveOrganizationId,
  } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [busyEntryId, setBusyEntryId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [form, setForm] = useState<EntryForm>(emptyForm);

  const role = user?.membership?.role;
  const canManage = role === "owner" || role === "admin";

  const selectedOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === activeOrganizationId,
      ) ?? null,
    [organizations, activeOrganizationId],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function loadOrganizations() {
      setIsLoadingOrganizations(true);
      setError("");

      try {
        const token = getAccessToken();

        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const result = await getOrganizations(token);

        if (cancelled) return;

        setOrganizations(result);

        if (result.length === 0) {
          setEntries([]);
          setError("You do not belong to an organization yet.");
          return;
        }

        const activeOrganizationExists = result.some(
          (organization) => organization.id === activeOrganizationId,
        );

        if (!activeOrganizationExists) {
          setActiveOrganizationId(result[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your organizations.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrganizations(false);
        }
      }
    }

    void loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    activeOrganizationId,
    setActiveOrganizationId,
    router,
  ]);

  const refreshEntries = useCallback(async () => {
    if (
      authLoading ||
      !isAuthenticated ||
      activeOrganizationId === null
    ) {
      setEntries([]);
      return;
    }

    setIsLoadingEntries(true);
    setError("");

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const result = await getKnowledgeEntries(
        token,
        activeOrganizationId,
      );

      setEntries(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load knowledge articles.",
      );
    } finally {
      setIsLoadingEntries(false);
    }
  }, [authLoading, isAuthenticated, activeOrganizationId]);

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      activeOrganizationId === null
    ) {
      return;
    }

    let cancelled = false;

    async function loadEntries() {
      setIsLoadingEntries(true);
      setError("");

      try {
        const token = getAccessToken();

        if (!token) {
          throw new Error(
            "Your session has expired. Please log in again.",
          );
        }

        const result = await getKnowledgeEntries(
          token,
          activeOrganizationId!,
        );

        if (!cancelled) {
          setEntries(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load knowledge articles.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEntries(false);
        }
      }
    }

    void loadEntries();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    activeOrganizationId,
  ]);

  const categories = useMemo(() => {
    const values = entries
      .map((entry) => entry.category?.trim())
      .filter((category): category is string => Boolean(category));

    return Array.from(new Set(values)).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesSearch =
        !query ||
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        (entry.category ?? "").toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "all" ||
        entry.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [entries, searchTerm, selectedCategory]);

  function openCreateForm() {
    setEditingEntryId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(entry: KnowledgeEntry) {
    setEditingEntryId(entry.id);
    setForm({
      title: entry.title,
      content: entry.content,
      category: entry.category ?? "",
      is_published: entry.is_published,
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEntryId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage || activeOrganizationId === null) {
      setError("You do not have permission to manage knowledge articles.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category.trim() || null,
        is_published: form.is_published,
      };

      if (editingEntryId !== null) {
        await updateKnowledgeEntry(
          token,
          activeOrganizationId,
          editingEntryId,
          payload,
        );
        setSuccess("Knowledge article updated successfully.");
      } else {
        await createKnowledgeEntry(
          token,
          activeOrganizationId,
          payload,
        );
        setSuccess("Knowledge article created successfully.");
      }

      closeForm();
      await refreshEntries();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the knowledge article.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublishToggle(entry: KnowledgeEntry) {
    if (!canManage || activeOrganizationId === null) return;

    const action = entry.is_published ? "unpublish" : "publish";

    if (
      !window.confirm(
        `Are you sure you want to ${action} "${entry.title}"?`,
      )
    ) {
      return;
    }

    setBusyEntryId(entry.id);
    setError("");
    setSuccess("");

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      await updateKnowledgeEntry(
        token,
        activeOrganizationId,
        entry.id,
        { is_published: !entry.is_published },
      );

      setSuccess(
        entry.is_published
          ? "Article moved to drafts."
          : "Article published successfully.",
      );

      await refreshEntries();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change the article's publication status.",
      );
    } finally {
      setBusyEntryId(null);
    }
  }

  async function handleDelete(entry: KnowledgeEntry) {
    if (!canManage || activeOrganizationId === null) return;

    if (
      !window.confirm(
        `Delete "${entry.title}" permanently? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setBusyEntryId(entry.id);
    setError("");
    setSuccess("");

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      await deleteKnowledgeEntry(
        token,
        activeOrganizationId,
        entry.id,
      );

      setEntries((current) =>
        current.filter((item) => item.id !== entry.id),
      );
      setSuccess("Knowledge article deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the knowledge article.",
      );
    } finally {
      setBusyEntryId(null);
    }
  }

  if (authLoading || isLoadingOrganizations) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-text-muted">
        <LoaderCircle className="animate-spin" size={20} />
        <span>Loading your workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <BookOpen size={22} />
            <span className="text-sm font-semibold">Support resources</span>
          </div>

          <h1 className="text-2xl font-bold text-text sm:text-3xl">
            Knowledge Base
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Keep helpful answers, procedures, and product information
            organized for your support team.
          </p>

          {selectedOrganization && (
            <p className="mt-2 text-sm text-text-muted">
              Workspace:{" "}
              <span className="font-medium text-text">
                {selectedOrganization.name}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void refreshEntries()}
            disabled={isLoadingEntries}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${isLoadingEntries ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {canManage && (
            <Button onClick={openCreateForm}>
              <Plus size={17} className="mr-2" />
              New article
            </Button>
          )}
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-danger/30 bg-danger-light p-4 text-sm text-danger"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-lg border border-success/30 bg-success-light p-4 text-sm text-success"
        >
          <p>{success}</p>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
            className="shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {showForm && canManage && (
        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-text">
              {editingEntryId === null ? "Create article" : "Edit article"}
            </h2>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeForm}
              aria-label="Close article form"
            >
              <X size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Article title"
              name="title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="e.g. How to reset a customer password"
              minLength={2}
              maxLength={255}
              required
              disabled={isSaving}
            />

            <div className="space-y-2">
              <label
                htmlFor="knowledge-content"
                className="block text-sm font-medium text-text"
              >
                Article content
              </label>
              <textarea
                id="knowledge-content"
                name="content"
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
                placeholder="Write the answer or procedure clearly..."
                rows={8}
                required
                disabled={isSaving}
                className="w-full rounded-md border border-border-strong bg-surface px-3.5 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="text-xs text-text-muted">
                Include the steps or details your support team needs.
              </p>
            </div>

            <Input
              label="Category (optional)"
              name="category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              placeholder="e.g. Billing, Account access, Troubleshooting"
              maxLength={100}
              disabled={isSaving}
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_published: event.target.checked,
                  }))
                }
                disabled={isSaving}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium text-text">
                  Publish immediately
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  Published articles are visible to all members of this
                  organization. Leave unchecked to save a draft.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving && (
                  <LoaderCircle size={16} className="mr-2 animate-spin" />
                )}
                {isSaving
                  ? "Saving..."
                  : editingEntryId === null
                    ? "Create article"
                    : "Save changes"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search titles, content, or categories..."
              aria-label="Search knowledge articles"
              className="w-full rounded-md border border-border-strong bg-surface py-2.5 pl-10 pr-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            aria-label="Filter by category"
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-sm text-text-muted">
          <span>
            {filteredEntries.length}{" "}
            {filteredEntries.length === 1 ? "article" : "articles"}
          </span>
          {canManage ? (
            <span>Drafts and published articles</span>
          ) : (
            <span>Published articles only</span>
          )}
        </div>
      </Card>

      {isLoadingEntries ? (
        <div className="flex min-h-48 items-center justify-center gap-3 text-text-muted">
          <LoaderCircle size={20} className="animate-spin" />
          <span>Loading knowledge articles...</span>
        </div>
      ) : filteredEntries.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
            {searchTerm || selectedCategory !== "all" ? (
              <Search size={25} />
            ) : (
              <FileText size={25} />
            )}
          </div>

          <h2 className="text-lg font-semibold text-text">
            {searchTerm || selectedCategory !== "all"
              ? "No matching articles"
              : "Your Knowledge Base is empty"}
          </h2>

          <p className="mt-2 max-w-md text-sm text-text-muted">
            {searchTerm || selectedCategory !== "all"
              ? "Try a different search term or category."
              : canManage
                ? "Create your first article to give your support team a reliable place to find answers."
                : "Published support articles will appear here when your organization adds them."}
          </p>

          {canManage &&
            !searchTerm &&
            selectedCategory === "all" && (
              <Button className="mt-5" onClick={openCreateForm}>
                <Plus size={17} className="mr-2" />
                Create first article
              </Button>
            )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={entry.is_published ? "success" : "warning"}
                      >
                        {entry.is_published ? "Published" : "Draft"}
                      </Badge>

                      {entry.category && (
                        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                          <Tag size={13} />
                          {entry.category}
                        </span>
                      )}
                    </div>

                    <h2 className="break-words text-lg font-semibold text-text">
                      {entry.title}
                    </h2>

                    <p className="mt-1 text-xs text-text-muted">
                      Updated {formatDate(entry.updated_at)}
                    </p>
                  </div>

                  {canManage && (
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(entry)}
                        disabled={busyEntryId === entry.id || isSaving}
                      >
                        <Pencil size={14} className="mr-1.5" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handlePublishToggle(entry)}
                        disabled={busyEntryId === entry.id || isSaving}
                      >
                        {busyEntryId === entry.id ? (
                          <LoaderCircle size={14} className="mr-1.5 animate-spin" />
                        ) : null}
                        {entry.is_published ? "Unpublish" : "Publish"}
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => void handleDelete(entry)}
                        disabled={busyEntryId === entry.id || isSaving}
                        aria-label={`Delete ${entry.title}`}
                      >
                        <Trash2 size={14} className="mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                <div className="whitespace-pre-wrap break-words border-t border-border pt-4 text-sm leading-7 text-text-secondary">
                  {entry.content}
                </div>

                <p className="text-xs text-text-muted">
                  Created {formatDate(entry.created_at)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

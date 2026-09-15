
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MessageCircle,
  Send,
  User,
} from "lucide-react";

import { getAccessToken } from "@/lib/auth-storage";
import {
  getConversation,
  updateConversationPriority,
  updateConversationStatus,
} from "@/lib/conversations";
import {
  createConversationMessage,
  getConversationMessages,
} from "@/lib/messages";
import { getCurrentUser } from "@/lib/auth";

import type {
  Conversation,
  ConversationPriority,
  ConversationStatus,
  Message,
  User as UserType,
} from "@/types/api";

const statusOptions: ConversationStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
];

const priorityOptions: ConversationPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getStatusClasses(status: ConversationStatus): string {
  switch (status) {
    case "open":
      return "bg-green-50 text-green-700 border-green-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "resolved":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "closed":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getPriorityClasses(priority: ConversationPriority): string {
  switch (priority) {
    case "urgent":
      return "bg-red-50 text-red-700 border-red-200";
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "low":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const conversationId = Number(params.conversationId);
  const organizationId = Number(searchParams.get("organizationId"));

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadConversation = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!conversationId || !organizationId) {
      setError("The conversation or organization could not be identified.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");

      const [conversationData, messagesData] = await Promise.all([
        getConversation(token, organizationId, conversationId),
        getConversationMessages(token, organizationId, conversationId),
      ]);
      
      setConversation(conversationData);
      setMessages(messagesData);
      
      try {
        // Loading the authenticated user separately so the conversation UI is not waiting for it.
        const userData = await getCurrentUser(token);
        setCurrentUser(userData);
      } catch {
        // Keeping the conversation available even when the optional user lookup is failing.
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the conversation.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, organizationId, router]);

  useEffect(() => {
    // Loading conversation data after the component is mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConversation();
  }, [loadConversation]);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAccessToken();

    if (!token || !messageText.trim() || !conversation) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const newMessage = await createConversationMessage(
        token,
        organizationId,
        conversation.id,
        {
          content: messageText.trim(),
          sender_type: "agent",
        },
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        newMessage,
      ]);

      setMessageText("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleStatusChange(status: ConversationStatus) {
    const token = getAccessToken();

    if (!token || !conversation || status === conversation.status) {
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const updatedConversation = await updateConversationStatus(
        token,
        organizationId,
        conversation.id,
        status,
      );

      setConversation(updatedConversation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the conversation status.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handlePriorityChange(priority: ConversationPriority) {
    const token = getAccessToken();

    if (!token || !conversation || priority === conversation.priority) {
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const updatedConversation = await updateConversationPriority(
        token,
        organizationId,
        conversation.id,
        priority,
      );

      setConversation(updatedConversation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the conversation priority.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="h-32 rounded-xl bg-white shadow-sm" />
            <div className="h-[500px] rounded-xl bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => router.push("/conversations")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to conversations
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Conversation not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigating back to the conversations list. */}
        <button
          type="button"
          onClick={() => router.push("/conversations")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to conversations
        </button>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Displaying the main conversation information and controls. */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <MessageCircle className="h-4 w-4" />
                  Conversation #{conversation.id}
                </div>

                <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  {conversation.subject || "Untitled conversation"}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Created {formatDate(conversation.created_at)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={conversation.status}
                  disabled={isUpdating}
                  onChange={(event) =>
                    handleStatusChange(
                      event.target.value as ConversationStatus,
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${getStatusClasses(
                    conversation.status,
                  )}`}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>

                <select
                  value={conversation.priority}
                  disabled={isUpdating}
                  onChange={(event) =>
                    handlePriorityChange(
                      event.target.value as ConversationPriority,
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 ${getPriorityClasses(
                    conversation.priority,
                  )}`}
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {formatLabel(priority)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Showing the conversation metadata. */}
          <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <User className="h-4 w-4" />
                Customer
              </div>
              <p className="font-medium text-slate-900">
                {conversation.customer_id
                  ? `Customer #${conversation.customer_id}`
                  : "No customer assigned"}
              </p>
            </div>

            <div className="p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <User className="h-4 w-4" />
                Assigned agent
              </div>
              <p className="font-medium text-slate-900">
                {conversation.assigned_agent_id
                  ? `Agent #${conversation.assigned_agent_id}`
                  : "Unassigned"}
              </p>
            </div>

            <div className="p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Clock className="h-4 w-4" />
                Last updated
              </div>
              <p className="font-medium text-slate-900">
                {formatDate(conversation.updated_at)}
              </p>
            </div>
          </div>
        </section>

        {/* Displaying the message thread and message composer. */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Conversation messages
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {messages.length}{" "}
              {messages.length === 1 ? "message" : "messages"}
            </p>
          </div>

          <div className="max-h-[550px] min-h-[350px] space-y-4 overflow-y-auto p-5 sm:p-6">
            {messages.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-medium text-slate-600">
                    No messages yet
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Start the conversation by sending a message below.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isAgent =
                  message.sender_type === "agent" &&
                  message.sender_user_id === currentUser?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isAgent ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                        isAgent
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md bg-slate-100 text-slate-900"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-xs font-medium">
                        <span
                          className={
                            isAgent ? "text-blue-100" : "text-slate-500"
                          }
                        >
                          {isAgent
                            ? "You"
                            : formatLabel(message.sender_type)}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {message.content}
                      </p>

                      <p
                        className={`mt-2 text-[11px] ${
                          isAgent ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
            <form onSubmit={handleSendMessage}>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Reply to customer
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <textarea
                  id="message"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  disabled={isSending}
                  className="min-h-[90px] flex-1 resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                <button
                  type="submit"
                  disabled={isSending || !messageText.trim()}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Messages are being sent as the authenticated support agent.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

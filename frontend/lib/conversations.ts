import { apiRequest } from "@/lib/api";
import type {
  Conversation,
  ConversationPriority,
  ConversationStatus,
} from "@/types/api";

export interface CreateConversationRequest {
  customer_id: number;
  subject?: string | null;
  priority?: ConversationPriority;
}

export async function getConversations(
  token: string,
  organizationId: number,
): Promise<Conversation[]> {
  return apiRequest<Conversation[]>(
    `/api/v1/organizations/${organizationId}/conversations`,
    {
      token,
    },
  );
}

export async function getConversation(
  token: string,
  organizationId: number,
  conversationId: number,
): Promise<Conversation> {
  return apiRequest<Conversation>(
    `/api/v1/organizations/${organizationId}/conversations/${conversationId}`,
    {
      token,
    },
  );
}

export async function createConversation(
  token: string,
  organizationId: number,
  data: CreateConversationRequest,
): Promise<Conversation> {
  return apiRequest<Conversation>(
    `/api/v1/organizations/${organizationId}/conversations`,
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function assignConversationAgent(
  token: string,
  organizationId: number,
  conversationId: number,
  agentId: number,
): Promise<Conversation> {
  return apiRequest<Conversation>(
    `/api/v1/organizations/${organizationId}/conversations/${conversationId}/assign?agent_id=${agentId}`,
    {
      method: "PATCH",
      token,
    },
  );
}

export async function updateConversationPriority(
  token: string,
  organizationId: number,
  conversationId: number,
  priority: ConversationPriority,
): Promise<Conversation> {
  return apiRequest<Conversation>(
    `/api/v1/organizations/${organizationId}/conversations/${conversationId}/priority?priority=${priority}`,
    {
      method: "PATCH",
      token,
    },
  );
}

export async function updateConversationStatus(
  token: string,
  organizationId: number,
  conversationId: number,
  status: ConversationStatus,
): Promise<Conversation> {
  return apiRequest<Conversation>(
    `/api/v1/organizations/${organizationId}/conversations/${conversationId}/status?conversation_status=${status}`,
    {
      method: "PATCH",
      token,
    },
  );
}

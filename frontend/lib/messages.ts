import { apiRequest } from "@/lib/api";
import type { Message, MessageSenderType } from "@/types/api";

export interface CreateMessageRequest {
  content: string;
  sender_type: MessageSenderType;
}

export async function getConversationMessages(
  token: string,
  organizationId: number,
  conversationId: number,
): Promise<Message[]> {
  return apiRequest<Message[]>(
    `/api/v1/organizations/${organizationId}/conversations/${conversationId}/messages`,
    {
      token,
    },
  );
}

export async function createConversationMessage(
  token: string,
  organizationId: number,
  conversationId: number,
  data: CreateMessageRequest,
): Promise<Message> {
  return apiRequest<Message>(
    `/api/v1/organizations/${organizationId}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}
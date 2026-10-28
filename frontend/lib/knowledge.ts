import { apiRequest } from "@/lib/api";
import type { KnowledgeEntry } from "@/types/api";

export interface CreateKnowledgeEntryRequest {
  title: string;
  content: string;
  category?: string | null;
  is_published: boolean;
}

export interface UpdateKnowledgeEntryRequest {
  title?: string;
  content?: string;
  category?: string | null;
  is_published?: boolean;
}

function knowledgeEndpoint(organizationId: number): string {
  return `/api/v1/organizations/${organizationId}/knowledge`;
}

export async function getKnowledgeEntries(
  token: string,
  organizationId: number,
): Promise<KnowledgeEntry[]> {
  return apiRequest<KnowledgeEntry[]>(
    knowledgeEndpoint(organizationId),
    { token },
  );
}

export async function createKnowledgeEntry(
  token: string,
  organizationId: number,
  data: CreateKnowledgeEntryRequest,
): Promise<KnowledgeEntry> {
  return apiRequest<KnowledgeEntry>(
    knowledgeEndpoint(organizationId),
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function updateKnowledgeEntry(
  token: string,
  organizationId: number,
  entryId: number,
  data: UpdateKnowledgeEntryRequest,
): Promise<KnowledgeEntry> {
  return apiRequest<KnowledgeEntry>(
    `${knowledgeEndpoint(organizationId)}/${entryId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function deleteKnowledgeEntry(
  token: string,
  organizationId: number,
  entryId: number,
): Promise<void> {
  return apiRequest<void>(
    `${knowledgeEndpoint(organizationId)}/${entryId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

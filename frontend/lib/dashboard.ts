import { apiRequest } from "@/lib/api";
import type {
  Conversation,
  Organization,
} from "@/types/api";

export interface DashboardConversationSummary {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  closed: number;
  urgent: number;
  high_priority: number;
  assigned: number;
  unassigned: number;
}

export interface DashboardOverview {
  organization: Pick<
    Organization,
    "id" | "name" | "slug" | "is_active"
  >;
  total_customers: number;
  conversations: DashboardConversationSummary;
  recent_conversations: Conversation[];
}

export async function getDashboardOverview(
  token: string,
  organizationId: number,
): Promise<DashboardOverview> {
  return apiRequest<DashboardOverview>(
    `/api/v1/organizations/${organizationId}/dashboard`,
    {
      token,
    },
  );
}

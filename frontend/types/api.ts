export interface User {
    id: number;
    email: string;
    full_name: string | null;
    is_active: boolean;
  }
  
  export interface Organization {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export type OrganizationRole =
    | "owner"
    | "admin"
    | "agent"
    | "member";
  
  export interface OrganizationMember {
    id: number;
    organization_id: number;
    user_id: number;
    role: OrganizationRole;
    created_at: string;
  }

  export interface Customer {
    id: number;
    organization_id: number;
    full_name: string;
    email: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
  }

  export type ConversationStatus =
  | "open"
  | "pending"
  | "resolved"
  | "closed";

export type ConversationPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export interface Conversation {
  id: number;
  organization_id: number;
  customer_id: number | null;
  assigned_agent_id: number | null;
  subject: string | null;
  status: ConversationStatus;
  priority: ConversationPriority;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}


export type MessageSenderType =
  | "agent"
  | "customer"
  | "system";

export interface Message {
  id: number;
  conversation_id: number;
  sender_type: MessageSenderType;
  sender_user_id: number | null;
  content: string;
  created_at: string;
}
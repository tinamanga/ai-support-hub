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
import { apiRequest } from "@/lib/api";
import type {
  Organization,
  OrganizationMember,
  OrganizationRole,
} from "@/types/api";

export interface CreateOrganizationRequest {
  name: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  is_active?: boolean;
}

export interface CreateOrganizationMemberRequest {
  user_id: number;
  role?: OrganizationRole;
}

export interface UpdateOrganizationMemberRequest {
  role: OrganizationRole;
}

export async function getOrganizations(
  token: string,
): Promise<Organization[]> {
  return apiRequest<Organization[]>("/api/v1/organizations", {
    token,
  });
}

export async function getOrganization(
  token: string,
  organizationId: number,
): Promise<Organization> {
  return apiRequest<Organization>(
    `/api/v1/organizations/${organizationId}`,
    {
      token,
    },
  );
}

export async function createOrganization(
  token: string,
  data: CreateOrganizationRequest,
): Promise<Organization> {
  return apiRequest<Organization>("/api/v1/organizations", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function updateOrganization(
  token: string,
  organizationId: number,
  data: UpdateOrganizationRequest,
): Promise<Organization> {
  return apiRequest<Organization>(
    `/api/v1/organizations/${organizationId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function deleteOrganization(
  token: string,
  organizationId: number,
): Promise<void> {
  return apiRequest<void>(
    `/api/v1/organizations/${organizationId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

export async function getOrganizationMembers(
  token: string,
  organizationId: number,
): Promise<OrganizationMember[]> {
  return apiRequest<OrganizationMember[]>(
    `/api/v1/organizations/${organizationId}/members`,
    {
      token,
    },
  );
}

export async function addOrganizationMember(
  token: string,
  organizationId: number,
  data: CreateOrganizationMemberRequest,
): Promise<OrganizationMember> {
  return apiRequest<OrganizationMember>(
    `/api/v1/organizations/${organizationId}/members`,
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function updateOrganizationMember(
  token: string,
  organizationId: number,
  memberId: number,
  data: UpdateOrganizationMemberRequest,
): Promise<OrganizationMember> {
  return apiRequest<OrganizationMember>(
    `/api/v1/organizations/${organizationId}/members/${memberId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function removeOrganizationMember(
  token: string,
  organizationId: number,
  memberId: number,
): Promise<void> {
  return apiRequest<void>(
    `/api/v1/organizations/${organizationId}/members/${memberId}`,
    {
      method: "DELETE",
      token,
    },
  );
}
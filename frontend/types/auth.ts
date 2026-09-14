import type { Organization, OrganizationMember, User } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  organization_name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser extends User {
  organization?: Organization;
  membership?: OrganizationMember;
}
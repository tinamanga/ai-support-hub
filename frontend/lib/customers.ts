import { apiRequest } from "@/lib/api";
import type { Customer } from "@/types/api";

export interface CreateCustomerRequest {
  full_name: string;
  email?: string | null;
  phone?: string | null;
}

export interface UpdateCustomerRequest {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
}

export async function getCustomers(
  token: string,
  organizationId: number,
): Promise<Customer[]> {
  return apiRequest<Customer[]>(
    `/api/v1/organizations/${organizationId}/customers`,
    {
      token,
    },
  );
}

export async function getCustomer(
  token: string,
  organizationId: number,
  customerId: number,
): Promise<Customer> {
  return apiRequest<Customer>(
    `/api/v1/organizations/${organizationId}/customers/${customerId}`,
    {
      token,
    },
  );
}

export async function createCustomer(
  token: string,
  organizationId: number,
  data: CreateCustomerRequest,
): Promise<Customer> {
  return apiRequest<Customer>(
    `/api/v1/organizations/${organizationId}/customers`,
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function updateCustomer(
  token: string,
  organizationId: number,
  customerId: number,
  data: UpdateCustomerRequest,
): Promise<Customer> {
  return apiRequest<Customer>(
    `/api/v1/organizations/${organizationId}/customers/${customerId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    },
  );
}

export async function deleteCustomer(
  token: string,
  organizationId: number,
  customerId: number,
): Promise<void> {
  return apiRequest<void>(
    `/api/v1/organizations/${organizationId}/customers/${customerId}`,
    {
      method: "DELETE",
      token,
    },
  );
}
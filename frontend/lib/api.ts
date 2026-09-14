import { API_URL } from "./config";

interface RequestOptions extends RequestInit {
  token?: string;
}

interface ApiValidationError {
  detail?: string | Array<{
    loc?: Array<string | number>;
    msg?: string;
  }>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorData: ApiValidationError =
        await response.json();

      if (typeof errorData.detail === "string") {
        message = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        message = errorData.detail
          .map((error) => error.msg)
          .filter(Boolean)
          .join(". ");
      }
    } catch {
      // Keep the default HTTP status message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
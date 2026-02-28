import { apiUrl } from "@/lib/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = apiUrl(path);
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data,
      `API error: ${response.status}`
    );
  }

  return data;
}

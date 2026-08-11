export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  const res = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: "include",
    headers: isFormData
      ? { ...init?.headers }
      : {
          "Content-Type": "application/json",
          ...init?.headers,
        },
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string; code?: string };
    };
    throw new ApiClientError(
      err?.error?.message ?? `HTTP ${res.status}`,
      err?.error?.code,
      res.status,
    );
  }

  const data = (await res.json()) as { data?: T } & T;
  return (data as { data?: T }).data ?? (data as T);
}

export function isStorageUnavailable(err: unknown): boolean {
  return (
    err instanceof ApiClientError && err.code === "STORAGE_UNAVAILABLE"
  );
}

const API_BASE = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";
const API_PATH = `${API_BASE}/api/method/qala_omni.api`;

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const path = `${API_PATH}/${endpoint}`;
  const url = new URL(path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, v);
      }
    });
  }
  return url.toString();
}

export async function crmFetch<T>(
  endpoint: string,
  params?: Record<string, string>,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET"
): Promise<T> {
  const isGet = method === "GET";
  const url = buildUrl(endpoint, isGet ? params : undefined);
  
  const options: RequestInit = {
    method,
    credentials: "include",
  };

  if (!isGet && params) {
    options.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    options.body = new URLSearchParams(params).toString();
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Frappe CRM API error: ${res.status} ${res.statusText}`);
  }
  
  const json = await res.json();
  return json.message !== undefined ? (json.message as T) : (json as T);
}

export async function crmFetchJson<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const url = buildUrl(endpoint);
  
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Frappe CRM API error: ${res.status} ${res.statusText}`);
  }
  
  const json = await res.json();
  return json.message !== undefined ? (json.message as T) : (json as T);
}

export async function fetchWithAuth(
  accessToken: string,
  url: string,
  options?: {
    method: "GET" | "PUT" | "POST" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    body?: string;
  },
) {
  if (options) {
    let { method, headers, body } = options;
    headers = headers || {};
    headers.Authorization = `Bearer ${accessToken}`;

    if (method === "GET" || method === "DELETE") {
      return fetch(url, { method, headers });
    } else {
      return fetch(url, { method, headers, body });
    }
  } else {
    return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  }
}

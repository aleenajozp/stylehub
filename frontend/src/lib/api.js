export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "/api" : "http://127.0.0.1:8000/api");

export function createLocalOrderId() {
  return `MM-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

export async function apiRequest(path, { method = "GET", body, authenticated = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  const accessToken = localStorage.getItem("accessToken");
  if (authenticated && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error(`Could not connect to the store. Check that the backend is running at ${API_BASE_URL}.`);
  }

  let data = null;
  if (response.status !== 204) {
    try {
      data = await response.json();
    } catch {
      throw new Error(`The store returned an unreadable response (HTTP ${response.status}).`);
    }
  }
  if (!response.ok) {
    const message = typeof data?.detail === "string"
      ? data.detail
      : Object.entries(data || {}).flatMap(([field, errors]) =>
        (Array.isArray(errors) ? errors : [errors])
          .filter(value => typeof value === "string")
          .map(value => `${field}: ${value}`),
      ).join(" ") || `The request failed (HTTP ${response.status}).`;
    throw new Error(message);
  }
  return data;
}

export function saveLocalOrder(order) {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  localStorage.setItem("orders", JSON.stringify([order, ...orders]));
}

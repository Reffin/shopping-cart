const BASE_URL = "http://localhost:5000/api";
export const formatPrice = (price) => `₱${price.toFixed(2)}`;

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// ── Auth ─────────────────────────────────────────────────────
export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

// ── Products ─────────────────────────────────────────────────
export async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/products?${query}`);
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function createProduct(data, token) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function updateProduct(id, data, token) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

// ── Orders ───────────────────────────────────────────────────
export async function placeOrder(data, token) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getMyOrders(token) {
  const res = await fetch(`${BASE_URL}/orders/my`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getAllOrders(token) {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function updateOrderStatus(id, status, token) {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}
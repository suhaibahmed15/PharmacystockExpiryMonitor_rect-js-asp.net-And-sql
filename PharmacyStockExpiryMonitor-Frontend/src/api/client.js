import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5135/api",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pharmacy_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const routes = {
  login: "/Auth/login",
  dashboard: "/Dashboard/summary",
  medicines: "/Medicine",
  categories: "/Category",
  suppliers: "/Supplier",
  batches: "/Batch",
  purchases: "/Purchase",
  transactions: "/StockTransaction",
  alerts: "/Alert",
  predictions: "/Intelligence",
  users: "/User",
  roles: "/Role"
};

export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function listFrom(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export function errorMessage(error) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.errors) {
    return Object.values(data.errors).flat().join(" ");
  }
  return data?.message || data?.title || error?.message || "Request failed.";
}

export default api;

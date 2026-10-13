import axios from "axios";

// Base API configuration using environment variable or default backend port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5135/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to decode JWT payload without external library
export function parseJwt(token) {
  try {
    if (!token) return null;
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

// Helper to extract clean error message from backend
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (typeof error.response?.data === "string") {
    return error.response.data;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

// ================= Auth =================
export const loginApi = (data) => api.post("/Auth/login", data);

// ================= Dashboard =================
export const getDashboardSummaryApi = () => api.get("/Dashboard/summary");

// ================= Medicines =================
export const getMedicinesApi = (params) => api.get("/Medicine", { params });
export const getMedicineByIdApi = (id) => api.get(`/Medicine/${id}`);
export const createMedicineApi = (data) => api.post("/Medicine", data);
export const updateMedicineApi = (id, data) => api.put(`/Medicine/${id}`, data);
export const deleteMedicineApi = (id) => api.delete(`/Medicine/${id}`);

// ================= Categories =================
export const getCategoriesApi = (params) => api.get("/Category", { params });
export const getCategoryByIdApi = (id) => api.get(`/Category/${id}`);
export const createCategoryApi = (data) => api.post("/Category", data);
export const updateCategoryApi = (id, data) => api.put(`/Category/${id}`, data);
export const deleteCategoryApi = (id) => api.delete(`/Category/${id}`);

// ================= Suppliers =================
export const getSuppliersApi = (params) => api.get("/Supplier", { params });
export const getSupplierByIdApi = (id) => api.get(`/Supplier/${id}`);
export const createSupplierApi = (data) => api.post("/Supplier", data);
export const updateSupplierApi = (id, data) => api.put(`/Supplier/${id}`, data);
export const deleteSupplierApi = (id) => api.delete(`/Supplier/${id}`);

// ================= Batches =================
export const getBatchesApi = () => api.get("/Batch");
export const getBatchByIdApi = (id) => api.get(`/Batch/${id}`);
export const getBatchesByMedicineApi = (medicineId) => api.get(`/Batch/medicine/${medicineId}`);
export const createBatchApi = (data) => api.post("/Batch", data);
export const updateBatchApi = (id, data) => api.put(`/Batch/${id}`, data);
export const deleteBatchApi = (id) => api.delete(`/Batch/${id}`);

// ================= Purchases =================
export const getPurchasesApi = () => api.get("/Purchase");
export const getPurchaseByIdApi = (id) => api.get(`/Purchase/${id}`);
export const createPurchaseApi = (data) => api.post("/Purchase", data);

// ================= Stock Transactions =================
export const getStockTransactionsApi = () => api.get("/StockTransaction");
export const getStockTransactionByIdApi = (id) => api.get(`/StockTransaction/${id}`);
export const createStockTransactionApi = (data) => api.post("/StockTransaction", data);

// ================= Alerts =================
export const getAlertsApi = () => api.get("/Alert");
export const getAlertByIdApi = (id) => api.get(`/Alert/${id}`);
export const markAlertAsReadApi = (id) => api.put(`/Alert/${id}/read`);
export const resolveAlertApi = (id) => api.put(`/Alert/${id}/resolve`);
export const createAlertApi = (data) => api.post("/Alert", data);

// ================= Intelligence / Predictions =================
export const getPredictionsApi = () => api.get("/Intelligence");
export const getPredictionByIdApi = (id) => api.get(`/Intelligence/${id}`);
export const evaluatePredictionApi = (data) => api.post("/Intelligence/evaluate", data);

// ================= Users & Roles (Admin Only) =================
export const getUsersApi = () => api.get("/User");
export const getUserByIdApi = (id) => api.get(`/User/${id}`);
export const createUserApi = (data) => api.post("/User", data);
export const assignUserRoleApi = (id, data) => api.post(`/User/${id}/role`, data);
export const deleteUserApi = (id) => api.delete(`/User/${id}`);

export const getRolesApi = () => api.get("/Role");
export const createRoleApi = (data) => api.post("/Role", data);
export const deleteRoleApi = (roleId) => api.delete(`/Role/${roleId}`);

export default api;

import api, { routes, listFrom } from "./client";

// Get list of suppliers (with optional search/pagination params)
export async function getSuppliers(params) {
  const response = await api.get(routes.suppliers, { params });
  return {
    data: listFrom(response),
    total: response.data?.totalCount || listFrom(response).length,
    raw: response
  };
}

// Get supplier by ID
export async function getSupplierById(id) {
  const response = await api.get(`${routes.suppliers}/${id}`);
  return response.data;
}

// Create new supplier
export async function createSupplier(payload) {
  const response = await api.post(routes.suppliers, payload);
  return response.data;
}

// Update existing supplier
export async function updateSupplier(id, payload) {
  const response = await api.put(`${routes.suppliers}/${id}`, payload);
  return response.data;
}

// Delete supplier
export async function deleteSupplier(id) {
  const response = await api.delete(`${routes.suppliers}/${id}`);
  return response.data;
}

export const suppliersApi = {
  getAll: getSuppliers,
  getById: getSupplierById,
  create: createSupplier,
  update: updateSupplier,
  remove: deleteSupplier
};

export default suppliersApi;

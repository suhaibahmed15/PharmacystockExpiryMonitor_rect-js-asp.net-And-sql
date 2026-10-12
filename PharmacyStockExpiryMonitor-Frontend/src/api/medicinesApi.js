import api, { routes, listFrom } from "./client";

// Get medicines list (with optional filter/pagination params)
export async function getMedicines(params) {
  const response = await api.get(routes.medicines, { params });
  return {
    data: listFrom(response),
    total: response.data?.totalCount || listFrom(response).length,
    raw: response
  };
}

// Get medicine by ID
export async function getMedicineById(id) {
  const response = await api.get(`${routes.medicines}/${id}`);
  return response.data;
}

// Create new medicine
export async function createMedicine(payload) {
  const response = await api.post(routes.medicines, payload);
  return response.data;
}

// Update existing medicine
export async function updateMedicine(id, payload) {
  const response = await api.put(`${routes.medicines}/${id}`, payload);
  return response.data;
}

// Delete medicine
export async function deleteMedicine(id) {
  const response = await api.delete(`${routes.medicines}/${id}`);
  return response.data;
}

export const medicinesApi = {
  getAll: getMedicines,
  getById: getMedicineById,
  create: createMedicine,
  update: updateMedicine,
  remove: deleteMedicine
};

export default medicinesApi;

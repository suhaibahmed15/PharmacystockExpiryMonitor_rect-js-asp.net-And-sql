import api, { routes, listFrom } from "./client";

// Get list of batches (with optional search/pagination params)
export async function getBatches(params) {
  const response = await api.get(routes.batches, { params });
  return {
    data: listFrom(response),
    total: response.data?.totalCount || listFrom(response).length,
    raw: response
  };
}

// Get batch by ID
export async function getBatchById(id) {
  const response = await api.get(`${routes.batches}/${id}`);
  return response.data;
}

// Create new batch
export async function createBatch(payload) {
  const response = await api.post(routes.batches, payload);
  return response.data;
}

// Update existing batch
export async function updateBatch(id, payload) {
  const response = await api.put(`${routes.batches}/${id}`, payload);
  return response.data;
}

// Delete batch
export async function deleteBatch(id) {
  const response = await api.delete(`${routes.batches}/${id}`);
  return response.data;
}

export const batchesApi = {
  getAll: getBatches,
  getById: getBatchById,
  create: createBatch,
  update: updateBatch,
  remove: deleteBatch
};

export default batchesApi;

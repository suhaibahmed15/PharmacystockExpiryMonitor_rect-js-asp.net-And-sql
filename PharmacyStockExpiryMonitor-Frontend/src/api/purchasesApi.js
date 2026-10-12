import api, { routes, listFrom } from "./client";

// Get list of purchases
export async function getPurchases(params) {
  const response = await api.get(routes.purchases, { params });
  return {
    data: listFrom(response),
    total: response.data?.totalCount || listFrom(response).length,
    raw: response
  };
}

// Get single purchase order by ID
export async function getPurchaseById(id) {
  const response = await api.get(`${routes.purchases}/${id}`);
  return response.data;
}

// Create new purchase order
export async function createPurchase(payload) {
  const response = await api.post(routes.purchases, payload);
  return response.data;
}

export const purchasesApi = {
  getAll: getPurchases,
  getById: getPurchaseById,
  create: createPurchase
};

export default purchasesApi;

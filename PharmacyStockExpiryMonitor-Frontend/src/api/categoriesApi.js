import api, { routes, listFrom } from "./client";

// Get list of categories (with optional search/pagination params)
export async function getCategories(params) {
  const response = await api.get(routes.categories, { params });
  return {
    data: listFrom(response),
    total: response.data?.totalCount || listFrom(response).length,
    raw: response
  };
}

// Get single category by ID
export async function getCategoryById(id) {
  const response = await api.get(`${routes.categories}/${id}`);
  return response.data;
}

// Create new category
export async function createCategory(payload) {
  const response = await api.post(routes.categories, payload);
  return response.data;
}

// Update existing category
export async function updateCategory(id, payload) {
  const response = await api.put(`${routes.categories}/${id}`, payload);
  return response.data;
}

// Delete category
export async function deleteCategory(id) {
  const response = await api.delete(`${routes.categories}/${id}`);
  return response.data;
}

export const categoriesApi = {
  getAll: getCategories,
  getById: getCategoryById,
  create: createCategory,
  update: updateCategory,
  remove: deleteCategory
};

export default categoriesApi;

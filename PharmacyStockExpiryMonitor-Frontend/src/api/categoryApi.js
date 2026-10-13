import axiosClient from "./axiosClient";

export const categoryApi = {
  getAll: (params) => axiosClient.get("/Category", { params }),
  getById: (id) => axiosClient.get(`/Category/${id}`),
  create: (data) => axiosClient.post("/Category", data),
  update: (id, data) => axiosClient.put(`/Category/${id}`, data),
  delete: (id) => axiosClient.delete(`/Category/${id}`)
};

export default categoryApi;

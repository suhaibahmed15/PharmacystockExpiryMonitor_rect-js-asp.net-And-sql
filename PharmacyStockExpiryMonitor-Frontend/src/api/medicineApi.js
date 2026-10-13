import axiosClient from "./axiosClient";

export const medicineApi = {
  getAll: (params) => axiosClient.get("/Medicine", { params }),
  getById: (id) => axiosClient.get(`/Medicine/${id}`),
  create: (data) => axiosClient.post("/Medicine", data),
  update: (id, data) => axiosClient.put(`/Medicine/${id}`, data),
  delete: (id) => axiosClient.delete(`/Medicine/${id}`)
};

export default medicineApi;

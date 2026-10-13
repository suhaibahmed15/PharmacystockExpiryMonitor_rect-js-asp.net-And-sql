import axiosClient from "./axiosClient";

export const supplierApi = {
  getAll: (params) => axiosClient.get("/Supplier", { params }),
  getById: (id) => axiosClient.get(`/Supplier/${id}`),
  create: (data) => axiosClient.post("/Supplier", data),
  update: (id, data) => axiosClient.put(`/Supplier/${id}`, data),
  delete: (id) => axiosClient.delete(`/Supplier/${id}`)
};

export default supplierApi;

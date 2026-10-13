import axiosClient from "./axiosClient";

export const batchApi = {
  getAll: () => axiosClient.get("/Batch"),
  getById: (id) => axiosClient.get(`/Batch/${id}`),
  getByMedicineId: (medicineId) => axiosClient.get(`/Batch/medicine/${medicineId}`),
  create: (data) => axiosClient.post("/Batch", data),
  update: (id, data) => axiosClient.put(`/Batch/${id}`, data),
  delete: (id) => axiosClient.delete(`/Batch/${id}`)
};

export default batchApi;

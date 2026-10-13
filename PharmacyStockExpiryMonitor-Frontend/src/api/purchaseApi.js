import axiosClient from "./axiosClient";

export const purchaseApi = {
  getAll: () => axiosClient.get("/Purchase"),
  getById: (id) => axiosClient.get(`/Purchase/${id}`),
  create: (data) => axiosClient.post("/Purchase", data)
};

export default purchaseApi;

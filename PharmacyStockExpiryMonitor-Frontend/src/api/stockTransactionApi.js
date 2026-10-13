import axiosClient from "./axiosClient";

export const stockTransactionApi = {
  getAll: () => axiosClient.get("/StockTransaction"),
  getById: (id) => axiosClient.get(`/StockTransaction/${id}`),
  create: (data) => axiosClient.post("/StockTransaction", data)
};

export default stockTransactionApi;

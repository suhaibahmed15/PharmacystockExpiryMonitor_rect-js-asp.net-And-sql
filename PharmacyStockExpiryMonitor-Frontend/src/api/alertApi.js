import axiosClient from "./axiosClient";

export const alertApi = {
  getAll: () => axiosClient.get("/Alert"),
  getById: (id) => axiosClient.get(`/Alert/${id}`),
  create: (data) => axiosClient.post("/Alert", data),
  markAsRead: (id) => axiosClient.put(`/Alert/${id}/read`),
  resolve: (id) => axiosClient.put(`/Alert/${id}/resolve`)
};

export default alertApi;

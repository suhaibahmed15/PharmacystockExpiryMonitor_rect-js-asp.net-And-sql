import axiosClient from "./axiosClient";

export const userApi = {
  getAll: () => axiosClient.get("/User"),
  getById: (id) => axiosClient.get(`/User/${id}`),
  create: (data) => axiosClient.post("/User", data),
  assignRole: (id, roleData) => axiosClient.post(`/User/${id}/role`, roleData),
  delete: (id) => axiosClient.delete(`/User/${id}`)
};

export default userApi;

import axiosClient from "./axiosClient";

export const roleApi = {
  getAll: () => axiosClient.get("/Role"),
  create: (data) => axiosClient.post("/Role", data),
  delete: (roleId) => axiosClient.delete(`/Role/${roleId}`)
};

export default roleApi;

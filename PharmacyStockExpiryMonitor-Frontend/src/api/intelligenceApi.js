import axiosClient from "./axiosClient";

export const intelligenceApi = {
  getAll: () => axiosClient.get("/Intelligence"),
  getById: (id) => axiosClient.get(`/Intelligence/${id}`),
  evaluate: (data) => axiosClient.post("/Intelligence/evaluate", data)
};

export default intelligenceApi;

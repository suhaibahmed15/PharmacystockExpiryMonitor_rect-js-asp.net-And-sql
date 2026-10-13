import axiosClient from "./axiosClient";

export const authApi = {
  login: (credentials) => axiosClient.post("/Auth/login", credentials)
};

export default authApi;

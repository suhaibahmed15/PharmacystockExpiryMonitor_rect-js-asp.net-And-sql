import axiosClient from "./axiosClient";

export const dashboardApi = {
  getSummary: () => axiosClient.get("/Dashboard/summary")
};

export default dashboardApi;

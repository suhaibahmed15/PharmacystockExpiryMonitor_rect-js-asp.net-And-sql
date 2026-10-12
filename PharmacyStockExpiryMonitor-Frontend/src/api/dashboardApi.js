import api, { routes } from "./client";

export async function getDashboardSummary() {
  const response = await api.get(routes.dashboard);
  return response.data;
}

export const dashboardApi = {
  getSummary: getDashboardSummary
};

export default dashboardApi;

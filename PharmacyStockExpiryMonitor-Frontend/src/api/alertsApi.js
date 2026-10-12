import api, { routes, listFrom } from "./client";

export async function getAlerts() {
  const response = await api.get(routes.alerts);
  return {
    raw: response,
    data: listFrom(response)
  };
}

export async function createAlert(payload) {
  const response = await api.post(routes.alerts, payload);
  return response.data;
}

export async function markAlertRead(id) {
  const response = await api.put(`${routes.alerts}/${id}/read`);
  return response.data;
}

export async function resolveAlert(id) {
  const response = await api.put(`${routes.alerts}/${id}/resolve`);
  return response.data;
}

export const alertsApi = {
  getAll: getAlerts,
  create: createAlert,
  markRead: markAlertRead,
  resolve: resolveAlert
};

export default alertsApi;

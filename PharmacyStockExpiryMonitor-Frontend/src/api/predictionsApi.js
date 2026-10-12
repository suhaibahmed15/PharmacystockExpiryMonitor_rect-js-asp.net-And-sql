import api, { routes, listFrom } from "./client";

export async function getPredictions() {
  const response = await api.get(routes.predictions);
  return {
    raw: response,
    data: listFrom(response)
  };
}

export async function evaluateForecast(payload) {
  const response = await api.post(`${routes.predictions}/evaluate`, payload);
  return response.data;
}

export const predictionsApi = {
  getAll: getPredictions,
  evaluate: evaluateForecast
};

export default predictionsApi;

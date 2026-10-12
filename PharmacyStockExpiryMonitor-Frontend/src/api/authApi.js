import api, { routes } from "./client";

export async function login(credentials) {
  const payload = typeof credentials === "string" 
    ? { email: credentials } 
    : { ...credentials };
  const response = await api.post(routes.login, payload);
  return response.data;
}

export function logout() {
  localStorage.removeItem("pharmacy_token");
  localStorage.removeItem("pharmacy_user");
}

export const authApi = {
  login,
  logout
};

export default authApi;

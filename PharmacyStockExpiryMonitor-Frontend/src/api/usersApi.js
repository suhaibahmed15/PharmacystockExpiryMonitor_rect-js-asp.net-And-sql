import api, { routes, listFrom } from "./client";

export async function getUsers() {
  const response = await api.get(routes.users);
  return {
    raw: response,
    data: listFrom(response)
  };
}

export async function createUser(payload) {
  const response = await api.post(routes.users, payload);
  return response.data;
}

export async function assignUserRole(userId, roleName) {
  const response = await api.post(`${routes.users}/${userId}/role`, { role: roleName });
  return response.data;
}

export async function deleteUser(id) {
  const response = await api.delete(`${routes.users}/${id}`);
  return response.data;
}

export async function getRoles() {
  const response = await api.get(routes.roles);
  return {
    raw: response,
    data: listFrom(response)
  };
}

export async function createRole(roleNameOrPayload) {
  const payload = typeof roleNameOrPayload === "string"
    ? { name: roleNameOrPayload }
    : { name: roleNameOrPayload?.name || roleNameOrPayload?.roleName };
  const response = await api.post(routes.roles, payload);
  return response.data;
}

export const usersApi = {
  getAll: getUsers,
  create: createUser,
  assignRole: assignUserRole,
  remove: deleteUser,
  getRoles,
  createRole
};

export default usersApi;

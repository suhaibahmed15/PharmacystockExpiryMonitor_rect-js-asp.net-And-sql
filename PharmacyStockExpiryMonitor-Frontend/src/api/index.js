export { default as api, routes, parseJwt, listFrom, errorMessage } from "./client";

export * from "./authApi";
export { default as authApi } from "./authApi";

export * from "./dashboardApi";
export { default as dashboardApi } from "./dashboardApi";

export * from "./medicinesApi";
export { default as medicinesApi } from "./medicinesApi";

export * from "./batchesApi";
export { default as batchesApi } from "./batchesApi";

export * from "./transactionsApi";
export { default as transactionsApi } from "./transactionsApi";

export * from "./purchasesApi";
export { default as purchasesApi } from "./purchasesApi";

export * from "./alertsApi";
export { default as alertsApi } from "./alertsApi";

export * from "./predictionsApi";
export { default as predictionsApi } from "./predictionsApi";

export * from "./categoriesApi";
export { default as categoriesApi } from "./categoriesApi";

export * from "./suppliersApi";
export { default as suppliersApi } from "./suppliersApi";

export * from "./usersApi";
export { default as usersApi } from "./usersApi";

import api from "./client";
export default api;

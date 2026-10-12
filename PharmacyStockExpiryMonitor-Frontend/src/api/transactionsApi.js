import api, { routes, listFrom } from "./client";

// Get list of stock transactions / audit records
export async function getTransactions(params) {
  const response = await api.get(routes.transactions, { params });
  return {
    data: listFrom(response),
    total: response.data?.totalCount || listFrom(response).length,
    raw: response
  };
}

// Create stock transaction
export async function createTransaction(payload) {
  const response = await api.post(routes.transactions, payload);
  return response.data;
}

// Helper to dispense medicine directly
export async function dispenseMedicine({ batchId, quantity, notes = "Dispensed to patient" }) {
  const payload = {
    batchId,
    transactionType: "Dispensed",
    quantity: Number(quantity),
    notes
  };
  return createTransaction(payload);
}

export const transactionsApi = {
  getAll: getTransactions,
  create: createTransaction,
  dispense: dispenseMedicine
};

export default transactionsApi;

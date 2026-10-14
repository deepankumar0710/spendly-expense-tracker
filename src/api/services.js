import api, { tokenStore } from "./client";

export async function register(data) {
  const res = await api.post("/auth/register/", data);
  return res.data;
}

export async function login(username, password) {
  const { data } = await api.post("/auth/login/", { username, password });
  tokenStore.set(data);
  return data;
}

export const getMe = () => api.get("/auth/me/").then((r) => r.data);

export const fetchExpenses = (params = {}) =>
  api
    .get("/expenses/", { params: { page_size: 100, ...params } })
    .then((r) => r.data.results);

export const createExpense = (payload) =>
  api.post("/expenses/", payload).then((r) => r.data);

export const updateExpense = (id, payload) =>
  api.patch(`/expenses/${id}/`, payload).then((r) => r.data);

export const deleteExpense = (id) => api.delete(`/expenses/${id}/`);

export const fetchSummary = () => api.get("/summary/").then((r) => r.data);
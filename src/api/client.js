import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const tokenStore = {
  getAccess: () => localStorage.getItem("spendly_access"),
  getRefresh: () => localStorage.getItem("spendly_refresh"),
  set: ({ access, refresh }) => {
    if (access) localStorage.setItem("spendly_access", access);
    if (refresh) localStorage.setItem("spendly_refresh", refresh);
  },
  clear: () => {
    localStorage.removeItem("spendly_access");
    localStorage.removeItem("spendly_refresh");
  },
};

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refresh = tokenStore.getRefresh();
    const isAuthCall =
      original?.url?.includes("/auth/login/") ||
      original?.url?.includes("/auth/token/refresh/");

    if (error.response?.status === 401 && !original._retry && refresh && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise =
          refreshPromise ||
          axios
            .post(`${API_URL}/auth/token/refresh/`, { refresh })
            .finally(() => {
              refreshPromise = null;
            });
        const { data } = await refreshPromise;
        tokenStore.set({ access: data.access });
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (refreshError) {
        if (refreshError.response?.status === 401) {
          tokenStore.clear();
          window.dispatchEvent(new Event("spendly:logout"));
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
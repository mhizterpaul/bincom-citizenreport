import axios from "axios";
import { store } from "../store";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://www.citizen-report.eu-4.evennode.com/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from Redux store
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and auth state on unauthorized
      localStorage.removeItem("token");
      store.dispatch({ type: "auth/logout" });
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;

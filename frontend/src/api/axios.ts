import axios from "axios";

// Create base URL based on environment
const baseURL =
  import.meta.env.VITE_API_URL ||
  "http://www.citizen-report.eu-4.evennode.com/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Don't add Authorization header for login/register requests
    const isAuthRoute = config.url?.includes("/auth/");
    const token = localStorage.getItem("token");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure OPTIONS requests are handled properly
    if (config.method === "options") {
      config.headers["Access-Control-Request-Method"] =
        "POST, GET, DELETE, PUT, PATCH";
      config.headers["Access-Control-Request-Headers"] =
        "Content-Type, Authorization";
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
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;

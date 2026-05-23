import axios from "axios";

// 🔥 Always use ENV (no fallback confusion)
const API_BASE_URL = import.meta.env.VITE_API_URL as string;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined");
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔐 Attach token (except public routes)
api.interceptors.request.use((config) => {
  const url = config.url ?? "";

  const publicPaths = [
    "/auth/login/json",
    "/auth/register",
    "/slots/public",
    "/health",
  ];

  const isPublic = publicPaths.some((p) => url.includes(p));

  const token = localStorage.getItem("token");

  if (token && !isPublic) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export default api;
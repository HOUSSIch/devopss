import axios from "axios";
import keycloak from "../contexts/keycloak";
import { recordApiPerformanceMetric } from "../utils/performanceMetrics";

const API_BASE = import.meta.env.VITE_API_URL as string | undefined;

if (!API_BASE) {
  console.error(
    "Missing VITE_API_URL. Set it to your backend URL before using API requests."
  );
}

export const http = axios.create({
  baseURL: API_BASE ?? "",
});

// Avant chaque requête: refresh + inject Bearer
http.interceptors.request.use(async (config) => {
  if (!API_BASE) {
    return Promise.reject(
      new Error(
        "VITE_API_URL is missing. Configure the backend URL before making API requests."
      )
    );
  }

  config.metadata = { startTime: performance.now() };

  if (keycloak.authenticated) {
    // refresh si expire bientôt
    await keycloak.updateToken(30);
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => {
    const startTime = response.config.metadata?.startTime;

    if (typeof startTime === "number") {
      recordApiPerformanceMetric({
        method: (response.config.method ?? "get").toUpperCase(),
        url: response.config.url ?? "unknown",
        status: response.status,
        durationMs: Math.round(performance.now() - startTime),
      });
    }

    return response;
  },
  (error) => {
    const startTime = error.config?.metadata?.startTime;

    if (typeof startTime === "number") {
      recordApiPerformanceMetric({
        method: (error.config.method ?? "get").toUpperCase(),
        url: error.config.url ?? "unknown",
        status: error.response?.status,
        durationMs: Math.round(performance.now() - startTime),
      });
    }

    return Promise.reject(error);
  }
);
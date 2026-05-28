import axios from "axios";
import { getApiUrl } from "../config";

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

const cacheStore = new Map();

export const clearCache = () => {
  cacheStore.clear();
};

const originalGet = api.get;
api.get = async function (url, config) {
  const bypassCache = config?.cache === false || url.includes("/auth/");
  if (bypassCache) {
    return originalGet.call(this, url, config);
  }

  const cacheKey = url + (config?.params ? JSON.stringify(config.params) : "");
  const now = Date.now();
  const cached = cacheStore.get(cacheKey);

  if (cached && now - cached.timestamp < 5 * 60 * 1000) {
    return cached.response;
  }

  const response = await originalGet.call(this, url, config);
  cacheStore.set(cacheKey, {
    response,
    timestamp: now,
  });
  return response;
};

api.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();
    if (method && ["post", "put", "delete", "patch"].includes(method)) {
      clearCache();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isRefreshRequest = requestUrl.includes("/auth/refresh/");
    const { status, data } = error.response || {};

    // console.log(
    //   `[Interceptor] Request: ${originalRequest.method?.toUpperCase()} ${requestUrl}, Status: ${status}, IsRefresh: ${isRefreshRequest}, Retry: ${originalRequest._retry}`,
    // );

    // Only attempt refresh on 401 if the error code indicates an expired token.
    // This prevents refresh attempts for unauthenticated users.
    // `simple-jwt` sends a `token_not_valid` code for expired tokens.
    if (
      status === 401 &&
      data?.code === "token_not_valid" &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      // console.log("[Interceptor] Attempting token refresh...");
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh/");
        // console.log(
        //   "[Interceptor] Token refresh successful, retrying original request",
        // );
        return api(originalRequest);
      } catch (err) {
        // console.error(
        //   "[Interceptor] Token refresh failed:",
        //   err.response?.status,
        //   err.message,
        // );
        return Promise.reject(err);
      }
    }

    // console.log(
    //   `[Interceptor] Not retrying. Status: ${status}, Already retried: ${originalRequest._retry}, Is refresh: ${isRefreshRequest}`,
    // );
    return Promise.reject(error);
  },
);

export const getExperiences = () => api.get("/experiences");
export const getExperience = (id) => api.get(`/experiences/${id}`);
export const createBooking = (data) => api.post("/bookings", data);
export const getBookings = (userId) => api.get(`/bookings/user/${userId}`);
export const loginUser = (data) => api.post("/auth/login", data);
export default api;

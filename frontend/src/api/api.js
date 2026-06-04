import axios from "axios";
import { getApiUrl } from "../config";

import { supabase } from "../config/supabaseClient";

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      console.error("Error getting Supabase session for request:", err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export const getExperiences = () => api.get("/api/experiences/");
export const getExperience = (id) => api.get(`/api/experience/${id}`);
export const createBooking = (data) => api.post("/api/booking/create/", data);
export const getBookings = (userId) => api.get(`/bookings/user/${userId}`);
export const loginUser = (data) => api.post("/auth/login", data);
export default api;

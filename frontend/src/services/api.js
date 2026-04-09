// services/api.js
// Thin axios wrapper — one place to change the base URL.
import axios from "axios";

const api = axios.create({
  // VITE_API_BASE can be set for production. In dev, Vite proxies /api → localhost:5000.
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 10000,
});

export const foodApi = {
  list: (params) => api.get("/food", { params }).then((r) => r.data),
  get: (id) => api.get(`/food/${id}`).then((r) => r.data),
  create: (data) => api.post("/food", data).then((r) => r.data),
  remove: (id) => api.delete(`/food/${id}`).then((r) => r.data),
};

export const ratingApi = {
  submit: (data) => api.post("/rating", data).then((r) => r.data),
  forFood: (foodId) => api.get(`/rating/${foodId}`).then((r) => r.data),
  seedDemo: (foodId, count = 10, lowRatings = false) =>
    api.post("/rating/seed-demo", { foodId, count, lowRatings }).then((r) => r.data),
};

export const analyticsApi = {
  overview: (limit = 10) =>
    api.get("/analytics", { params: { limit } }).then((r) => r.data),
  forFood: (foodId) => api.get(`/analytics/${foodId}`).then((r) => r.data),
};

export default api;

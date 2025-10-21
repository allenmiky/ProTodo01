// src/config/api.js
import axios from "axios";

// ✅ Aapka backend URL directly use karo
const API_BASE = import.meta.env.VITE_API_URL || "https://protodobackend-production.up.railway.app";

const API = axios.create({
  baseURL: API_BASE,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ------- Auth APIs -------
export const login = (credentials) => API.post("/api/auth/login", credentials);
export const register = (userData) => API.post("/api/auth/register", userData);
export const forgotPassword = (email) => API.post("/api/auth/forgot-password", { email });
export const resetPassword = (token, newPassword) => API.post("/api/auth/reset-password", { token, newPassword });
export const getProfile = () => API.get("/api/auth/profile");
export const updateProfile = (userData) => API.put("/api/auth/profile", userData);

// ------- Board APIs -------
export const getBoards = () => API.get("/api/boards");
export const createBoard = (name) => API.post("/api/boards", { name });
export const deleteBoard = (id) => API.delete(`/api/boards/${id}`);
export const archiveBoard = (id) => API.put(`/api/boards/${id}/archive`);

// ------- Task APIs -------
export const getTasks = (boardId) => API.get(`/api/tasks/${boardId}`);
export const createTask = (task) => API.post("/api/tasks", task);
export const deleteTask = (id) => API.delete(`/api/tasks/${id}`);
export const updateTask = (id, updates) => API.put(`/api/tasks/${id}`, updates);
export const moveTask = (taskId, newBoardId) => API.put(`/api/tasks/${taskId}/move`, { newBoardId });

// ------- Category APIs -------
export const getCategories = (boardId) => API.get(`/api/categories/${boardId}`);
export const createCategory = (category) => API.post("/api/categories", category);
export const updateCategory = (id, updates) => API.put(`/api/categories/${id}`, updates);
export const deleteCategory = (id) => API.delete(`/api/categories/${id}`);

// ✅ Export both base URL and axios instance
export { API };
export default API_BASE;

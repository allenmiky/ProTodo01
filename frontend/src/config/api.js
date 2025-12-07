import axios from "axios";

// 🌐 Choose API base URL (env → railway → local)
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ------- Board APIs -------
export const createBoard = (name) => API.post("/boards", { name });
export const deleteBoard = (id) => API.delete(`/boards/${id}`);
export const archiveBoard = (id) => API.put(`/boards/${id}/archive`);

// ------- Task APIs -------
export const getTasks = (boardId) => API.get(`/tasks/${boardId}`);
export const createTask = (task) => API.post("/tasks", task);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const updateTask = (id, updates) => API.put(`/tasks/${id}`, updates);

// ✅ Export API + base URL
export { API };
export default API_BASE;

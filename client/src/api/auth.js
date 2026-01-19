import api from "./axios";

// AUTH
export const signup = (data) => api.post("/auth/signup", data);
export const verifyOtp = (data) => api.post("/auth/verify-otp", data);
export const login = (data) => api.post("/auth/login", data);

// ADMIN
export const getPendingUsers = () => api.get("/admin/pending-users");
export const approveUser = (id) => api.post(`/admin/approve/${id}`);
export const rejectUser = (id) => api.post(`/admin/reject/${id}`);


import api from "./axios";

// USERS
export const getPendingUsers = () =>
  api.get("/admin/pending-users");

export const approveUser = (id) =>
  api.post(`/admin/approve/${id}`);

export const rejectUser = (id) =>
  api.post(`/admin/reject/${id}`);

export const getAllUsers = () =>
  api.get("/admin/users");

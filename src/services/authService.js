import api from "./api";

export const registerUser = async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
}

export const loginUser = async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data;
}

export const getUserProfile = async () => {
    const res = await api.get("/auth/profile");
    return res.data;
}

// Admin user management
export const getAllUsers = async (params = {}) => {
    const res = await api.get("/auth/users", { params });
    return res.data;
}

export const getUserById = async (userId) => {
    const res = await api.get(`/auth/users/${userId}`);
    return res.data;
}

export const createUser = async (userData) => {
    const res = await api.post("/auth/users", userData);
    return res.data;
}

export const updateUserRole = async (userId, role) => {
    const res = await api.put(`/auth/users/${userId}/role`, { role });
    return res.data;
}

export const deleteUser = async (userId) => {
    const res = await api.delete(`/auth/users/${userId}`);
    return res.data;
}
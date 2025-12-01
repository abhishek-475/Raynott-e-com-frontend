import api from "./api";

// Create a new order
export const createOrder = async (data) => {
    const res = await api.post("/orders", data);
    return res.data;
};

// Get logged-in user's orders
export const getMyOrders = async () => {
    const res = await api.get("/orders/myorders");
    return res.data;
};

// Get all orders (Admin only)
export const getAllOrders = async () => {
    const res = await api.get("/orders");
    return res.data;
};

// Get order by ID
export const getOrderById = async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
};

// Mark order as delivered (Admin only)
export const updateOrderToDelivered = async (id) => {
    const res = await api.put(`/orders/${id}/deliver`);
    return res.data;
};

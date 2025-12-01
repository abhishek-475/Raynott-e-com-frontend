import api from "./api";

// Create Razorpay order on backend
export const createPaymentOrder = async (data) => {
    const res = await api.post("/payment/create-order", data);
    return res.data;
};

// Verify Razorpay payment and create order in database
export const verifyPayment = async (data) => {
    const res = await api.post("/payment/verify", data);
    return res.data;
};

// Create Cash on Delivery order
export const createCODOrder = async (data) => {
    const res = await api.post("/payment/cod", data);
    return res.data;
};

// Get order details by ID
export const getOrderDetails = async (orderId) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
};

// Get user's orders
export const getUserOrders = async () => {
    const res = await api.get("/orders/my-orders");
    return res.data;
};

// Cancel order
export const cancelOrder = async (orderId) => {
    const res = await api.put(`/orders/${orderId}/cancel`);
    return res.data;
};

// Get payment status
export const getPaymentStatus = async (paymentId) => {
    const res = await api.get(`/payment/status/${paymentId}`);
    return res.data;
};

// Calculate COD eligibility
export const checkCODEligibility = (amount) => {
    const maxCOD = process.env.REACT_APP_MAX_COD_AMOUNT || 10000;
    return amount <= maxCOD;
};

// Calculate order totals (optional helper function)
export const calculateOrderTotals = (cartItems) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = subtotal > (process.env.REACT_APP_FREE_SHIPPING_THRESHOLD || 500) ? 0 : 50;
    const taxRate = process.env.REACT_APP_TAX_PERCENTAGE || 18;
    const tax = subtotal * (taxRate / 100);
    const grandTotal = subtotal + shippingFee + tax;
    
    return {
        subtotal,
        shippingFee,
        tax,
        grandTotal
    };
};
import api from "./api";

// GET all products
export const getProducts = async () => {
    const res = await api.get("/products");
    return res.data;
};

// GET single product by ID
export const getProductById = async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
};

// SEARCH products with filters
export const searchProducts = async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.query) queryParams.append('q', params.query);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = `/products/search${queryString ? `?${queryString}` : ''}`;

    const res = await api.get(url);
    return res.data;
};

// GET products by category
export const getProductsByCategory = async (category) => {
    const res = await api.get(`/products/category/${category}`);
    return res.data;
};

// GET all categories
export const getCategories = async () => {
    const res = await api.get("/products/categories");
    return res.data;
};

// GET featured products
export const getFeaturedProducts = async () => {
    const res = await api.get("/products/featured");
    return res.data;
};

// GET trending products
export const getTrendingProducts = async () => {
    const res = await api.get("/products/trending");
    return res.data;
};

// CREATE a new product (Admin only)
export const createProduct = async (data) => {
    const res = await api.post("/products", data);
    return res.data;
};

// UPDATE a product (Admin only)
export const updateProduct = async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
};

// DELETE a product (Admin only)
export const deleteProduct = async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
};
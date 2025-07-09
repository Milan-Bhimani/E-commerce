import axiosInstance from './axiosInstance';

const handleResponse = async (responsePromise) => {
  try {
    const response = await responsePromise;
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Something went wrong');
  }
};

export const api = {
  // Auth
  login: async (credentials) => handleResponse(axiosInstance.post('/api/auth/login', credentials)),
  register: async (userData) => handleResponse(axiosInstance.post('/api/auth/register', userData)),
  logout: async () => handleResponse(axiosInstance.post('/api/auth/logout')),
  getCurrentUser: async () => handleResponse(axiosInstance.get('/api/auth/me')),

  // Products
  getProducts: async (params = {}) => handleResponse(axiosInstance.get('/api/products', { params })),
  getProduct: async (id) => handleResponse(axiosInstance.get(`/api/products/${id}`)),
  createProduct: async (productData) => handleResponse(axiosInstance.post('/api/products', productData)),
  updateProduct: async (id, productData) => handleResponse(axiosInstance.put(`/api/products/${id}`, productData)),
  deleteProduct: async (id) => handleResponse(axiosInstance.delete(`/api/products/${id}`)),

  // Orders
  createOrder: async (orderData) => handleResponse(axiosInstance.post('/api/orders', orderData)),
  getOrder: async (id) => handleResponse(axiosInstance.get(`/api/orders/${id}`)),
  getMyOrders: async () => handleResponse(axiosInstance.get('/api/orders/my-orders')),
  getAllOrders: async () => handleResponse(axiosInstance.get('/api/orders')),
  updateOrderStatus: async (id, status) => handleResponse(axiosInstance.put(`/api/orders/${id}/status`, { status })),

  // Users
  getUsers: async () => handleResponse(axiosInstance.get('/api/users')),
  updateUser: async (id, userData) => handleResponse(axiosInstance.put(`/api/users/${id}`, userData)),
  deleteUser: async (id) => handleResponse(axiosInstance.delete(`/api/users/${id}`)),
};
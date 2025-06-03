const API_URL = 'http://localhost:5000';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  // Auth
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },
  
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },
  
  logout: async () => {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  // Products
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/products?${queryString}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  getProduct: async (id) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  createProduct: async (productData) => {
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },
  
  updateProduct: async (id, productData) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },
  
  deleteProduct: async (id) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  // Orders
  createOrder: async (orderData) => {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },
  
  getOrder: async (id) => {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  getMyOrders: async () => {
    const response = await fetch(`${API_URL}/api/orders/my-orders`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  getAllOrders: async () => {
    const response = await fetch(`${API_URL}/api/orders`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  
  updateOrderStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },
  
  // Users
  getUsers: async () => {
    const response = await fetch(`${API_URL}/api/users`);
    return handleResponse(response);
  },
  
  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },
  
  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
}; 
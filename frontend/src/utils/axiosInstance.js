import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Optional: Add an interceptor here if needed, similar to the one in AuthContext.jsx
/*
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle 401 errors, e.g., redirect to login
      // Note: Be careful with redirecting here, might cause issues in some contexts
      console.error('Unauthorized request:', error.response.data.message);
    }
    return Promise.reject(error);
  }
);
*/

export default api; 
// services/users.js
import axios from 'axios';

const baseUrl = 'http://localhost:5000/api/users';

// Set up axios interceptor to include auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const login = async (credentials) => {
  const response = await axios.post(`${baseUrl}/login`, credentials);
  
  // Store token in localStorage
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('currentUser', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
};

const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const getById = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`);
  return response.data;
};

const create = async (userData) => {
  const response = await axios.post(baseUrl, userData);
  return response.data;
};

const update = async (id, userData) => {
  const response = await axios.put(`${baseUrl}/${id}`, userData);
  return response.data;
};

const changePassword = async (id, passwordData) => {
  const response = await axios.put(`${baseUrl}/${id}/change-password`, passwordData);
  return response.data;
};

const remove = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`);
  return response.data;
};

export default {
  login,
  logout,
  getCurrentUser,
  getAll,
  getById,
  create,
  update,
  changePassword,
  remove
};
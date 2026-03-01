import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (email, password, inviteCode) =>
    api.post('/auth/signup', { email, password, inviteCode }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () =>
    api.get('/auth/me'),
};

export const entriesAPI = {
  getAll: (searchTerm) =>
    api.get('/entries', { params: { search: searchTerm } }),
  getById: (id) =>
    api.get(`/entries/${id}`),
  create: (word, definition) =>
    api.post('/entries', { word, definition }),
  update: (id, word, definition) =>
    api.put(`/entries/${id}`, { word, definition }),
  delete: (id) =>
    api.delete(`/entries/${id}`),
};

export const inviteAPI = {
  create: () =>
    api.post('/invite/create'),
  getCodes: () =>
    api.get('/invite/codes'),
  getUsers: () =>
    api.get('/invite/users'),
  updateUserContributor: (userId, isContributor) =>
    api.put(`/invite/users/${userId}/contributor`, { is_contributor: isContributor }),
};

export default api;

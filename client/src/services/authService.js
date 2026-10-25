import api from './api.js';

// Each function returns the useful part of the response, so components stay simple.
export const register = async (payload) => (await api.post('/auth/register', payload)).data.data.user;
export const login = async (credentials) => (await api.post('/auth/login', credentials)).data.data.user;
export const logout = async () => (await api.post('/auth/logout')).data;
export const getMe = async () => (await api.get('/auth/me')).data.data.user;

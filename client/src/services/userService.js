import api from './api.js';

export const getProfile = async () => (await api.get('/users/profile')).data.data.user;
export const updateProfile = async (payload) => (await api.put('/users/profile', payload)).data.data.user;

export const getSavedInternships = async () => (await api.get('/users/saved-internships')).data.data;
export const saveInternship = async (internshipId) =>
  (await api.post(`/users/saved-internships/${internshipId}`)).data;
export const unsaveInternship = async (internshipId) =>
  (await api.delete(`/users/saved-internships/${internshipId}`)).data;

import api, { cleanParams } from './api.js';

// List endpoints return { items, meta } where meta has total, page, limit, totalPages.
export const listInternships = async (params = {}) => {
  const { data } = await api.get('/internships', { params: cleanParams(params) });
  return { items: data.data, meta: data.meta };
};

export const getInternship = async (id) => (await api.get(`/internships/${id}`)).data.data;

export const createInternship = async (payload) => (await api.post('/internships', payload)).data.data;

export const updateInternship = async (id, payload) => (await api.put(`/internships/${id}`, payload)).data.data;

export const deleteInternship = async (id) => (await api.delete(`/internships/${id}`)).data;

export const getMyInternships = async (params = {}) => {
  const { data } = await api.get('/internships/recruiter/mine', { params: cleanParams(params) });
  return { items: data.data, meta: data.meta };
};

import api, { cleanParams } from './api.js';

export const applyToInternship = async (internshipId, payload = {}) =>
  (await api.post(`/applications/${internshipId}`, payload)).data.data;

export const getMyApplications = async (params = {}) => {
  const { data } = await api.get('/applications/student/mine', { params: cleanParams(params) });
  return { items: data.data, meta: data.meta };
};

// meta also contains statusCounts and the internship's title.
export const getInternshipApplicants = async (internshipId, params = {}) => {
  const { data } = await api.get(`/applications/internship/${internshipId}`, { params: cleanParams(params) });
  return { items: data.data, meta: data.meta };
};

export const updateApplicationStatus = async (applicationId, status) =>
  (await api.patch(`/applications/${applicationId}/status`, { status })).data.data;

export const withdrawApplication = async (applicationId) =>
  (await api.patch(`/applications/${applicationId}/withdraw`)).data;

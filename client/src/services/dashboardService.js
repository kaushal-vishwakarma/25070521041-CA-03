import api from './api.js';

export const getStudentDashboard = async () => (await api.get('/dashboard/student')).data.data;
export const getRecruiterDashboard = async () => (await api.get('/dashboard/recruiter')).data.data;

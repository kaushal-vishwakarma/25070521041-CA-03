import api from './api.js';

// { openInternships, companies, students, applications } counted from the database.
export const getPublicStats = async () => (await api.get('/stats')).data.data;

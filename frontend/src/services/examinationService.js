import api from './api.js';

/**
 * Examination API Service.
 * Handles instructor CRUD operations and student availability queries.
 */
export const createExamination = async (examData) => {
  const response = await api.post('/examinations', examData);
  return response.data;
};

export const getMyExaminations = async () => {
  const response = await api.get('/examinations/my');
  return response.data;
};

export const getExaminationById = async (id) => {
  const response = await api.get(`/examinations/${id}`);
  return response.data;
};

export const updateExamination = async (id, examData) => {
  const response = await api.put(`/examinations/${id}`, examData);
  return response.data;
};

export const deleteExamination = async (id) => {
  const response = await api.delete(`/examinations/${id}`);
  return response.data;
};

export const publishExamination = async (id) => {
  const response = await api.patch(`/examinations/${id}/publish`);
  return response.data;
};

export const getAvailableExaminations = async () => {
  const response = await api.get('/examinations/available');
  return response.data;
};

export const startOrResumeAttempt = async (id) => {
  const response = await api.get(`/examinations/${id}/start`);
  return response.data;
};

export const getStudentAttempt = async (id) => {
  const response = await api.get(`/examinations/${id}/attempt`);
  return response.data;
};

export const saveAttemptProgress = async (id, answers) => {
  const response = await api.patch(`/examinations/${id}/progress`, { answers });
  return response.data;
};

export const submitAttempt = async (id, answers = []) => {
  const response = await api.post(`/examinations/${id}/submit`, { answers });
  return response.data;
};

export default {
  createExamination,
  getMyExaminations,
  getExaminationById,
  updateExamination,
  deleteExamination,
  publishExamination,
  getAvailableExaminations,
  startOrResumeAttempt,
  getStudentAttempt,
  saveAttemptProgress,
  submitAttempt,
};


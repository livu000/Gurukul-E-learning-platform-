import api from './api';

// STUDENT and TEACHER
export const getAssignmentsByCourse = async (courseId) => {
  const res = await api.get(`/assignments/course/${courseId}`);
  return res.data;
};

export const submitAssignment = async (data) => {
  const res = await api.post('/assignments/submit', data);
  return res.data;
};

// TEACHER
export const createAssignment = async (data) => {
  const res = await api.post('/assignments', data);
  return res.data;
};

export const getSubmissions = async (assignmentId) => {
  const res = await api.get(`/assignments/${assignmentId}/submissions`);
  return res.data;
};

export const gradeSubmission = async (data) => {
  const res = await api.post('/assignments/grade', data);
  return res.data;
};

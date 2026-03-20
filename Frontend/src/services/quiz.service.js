import api from './api';

export const getQuizzesByCourse = async (courseId) => {
  const res = await api.get(`/quizzes/course/${courseId}`);
  return res.data;
};

export const startQuiz = async (quizId) => {
  const res = await api.post('/quiz-attempts/start', { quizId });
  return res.data;
};

export const getQuizQuestions = async (quizId) => {
  const res = await api.get(`/quiz-questions/quiz/${quizId}`);
  return res.data;
};

export const submitQuiz = async (payload) => {
  const res = await api.post('/quiz-submissions/submit', payload);
  return res.data;
};

export const getQuizResult = async (attemptId) => {
  const res = await api.get(`/quiz-attempts/${attemptId}`);
  return res.data;
};

export const getTeacherQuizzes = async () => {
  const res = await api.get('/quizzes/teacher');
  return res.data;
};

export const publishQuiz = async (quizId, isPublished = true) => {
  const res = await api.patch(`/quizzes/${quizId}/publish`, {
    isPublished
  });
  return res.data;
};

export const createQuiz = async (payload) => {
  const res = await api.post('/quizzes', payload);
  return res.data;
};

export const addQuizQuestion = async (payload) => {
  const res = await api.post('/quiz-questions/question', payload);
  return res.data;
};

export const addQuizOptions = async (payload) => {
  const res = await api.post('/quiz-questions/options', payload);
  return res.data;
};

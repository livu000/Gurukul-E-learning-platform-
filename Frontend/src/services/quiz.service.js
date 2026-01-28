import api from './api';

// STUDENT — list quizzes for a course
export const getQuizzesByCourse = async (courseId) => {
  const res = await api.get(`/quizzes/course/${courseId}`);
  return res.data;
};

// STUDENT — start quiz
export const startQuiz = async (quizId) => {
  const res = await api.post(`/quiz-attempts/start`, { quizId });
  return res.data;
};

// STUDENT — get quiz questions
export const getQuizQuestions = async (quizId) => {
  const res = await api.get(`/quiz-questions/quiz/${quizId}`);
  return res.data;
};

// STUDENT — submit quiz
export const submitQuiz = async (payload) => {
  const res = await api.post(`/quiz-submissions/submit`, payload);
  return res.data;
};

// STUDENT — view result
export const getQuizResult = async (attemptId) => {
  const res = await api.get(`/quiz-attempts/${attemptId}`);
  return res.data;
};

import api from './api';

export const getCourses = async (params = {}) => {
  const res = await api.get('/courses', { params });
  return res.data;
};

export const createCourse = async (data) => {
  const res = await api.post('/courses', data);
  return res.data;
};

export const updateCourse = async (courseId, data) => {
  const res = await api.patch(`/courses/${courseId}`, data);
  return res.data;
};

export const submitCourse = async (courseId) => {
  const res = await api.patch(`/courses/${courseId}/submit`);
  return res.data;
};

export const updateCourseStatus = async (courseId, action, rejectionReason) => {
  const res = await api.patch(`/courses/${courseId}/status`, { action, rejectionReason });
  return res.data;
};

export const getCourseById = async (courseId) => {
  const res = await api.get(`/courses/${courseId}`);
  return res.data;
};

export const getTeacherCourses = async (params = {}) => {
  const res = await api.get('/courses/mine', { params });
  return res.data;
};

export const getReviewQueue = async () => {
  const res = await api.get('/courses/review-queue');
  return res.data;
};

export const getModulesByCourse = async (courseId) => {
  const res = await api.get(`/modules/course/${courseId}`);
  return res.data;
};

export const getLessonsByModule = async (moduleId) => {
  const res = await api.get(`/lessons/module/${moduleId}`);
  return res.data;
};

export const getCourseProgress = async (courseId) => {
  const res = await api.get(`/progress/course/${courseId}`);
  return res.data;
};

export const createModule = async (courseId, title, extra = {}) => {
  const res = await api.post('/modules', { courseId, title, ...extra });
  return res.data;
};

export const reorderModules = async (courseId, modules) => {
  const res = await api.patch(`/modules/course/${courseId}/reorder`, { modules });
  return res.data;
};

export const createLesson = async (moduleId, lesson) => {
  const res = await api.post('/lessons', { moduleId, ...lesson });
  return res.data;
};

export const reorderLessons = async (moduleId, lessons) => {
  const res = await api.patch(`/lessons/module/${moduleId}/reorder`, { lessons });
  return res.data;
};

export const updateModule = async (moduleId, data) => {
  const res = await api.patch(`/modules/${moduleId}`, data);
  return res.data;
};

export const updateLesson = async (lessonId, data) => {
  const res = await api.patch(`/lessons/${lessonId}`, data);
  return res.data;
};

export const enrollInCourse = async (courseId) => {
  const res = await api.post(`/enrollments/${courseId}`);
  return res.data;
};

export const deleteModule = async (moduleId) => {
  const res = await api.delete(`/modules/${moduleId}`);
  return res.data;
};

export const deleteLesson = async (lessonId) => {
  const res = await api.delete(`/lessons/${lessonId}`);
  return res.data;
};

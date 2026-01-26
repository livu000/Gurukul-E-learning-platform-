import api from './api';

// Get courses (public / role-based)
export const getCourses = () => api.get('/courses');

// Create course (teacher/admin)
export const createCourse = (data) => api.post('/courses', data);

// Teacher submits course for review
export const submitCourse = (courseId) =>
  api.patch(`/courses/${courseId}/submit`);

// Admin approves or rejects course
export const updateCourseStatus = (courseId, status) =>
  api.patch(`/courses/${courseId}/status`, { status });

export const getModulesByCourse = async (courseId) => {
  const res = await api.get(`/modules/course/${courseId}`);
  return res.data;
};

export const getLessonsByModule = async (moduleId) => {
  const res = await api.get(`/lessons/module/${moduleId}`);
  return res.data;
};

// Get course progress (student only)
export const getCourseProgress = async (courseId) => {
  const res = await api.get(`/progress/course/${courseId}`);
  return res.data;
};

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

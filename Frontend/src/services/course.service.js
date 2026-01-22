import api from './api';

export const getCourses = () => api.get('/courses');

export const createCourse = (data) =>
  api.post('/courses', data);

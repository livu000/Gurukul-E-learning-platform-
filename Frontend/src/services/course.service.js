import api from "./api";

/* =========================
   COURSE API
========================= */

// Get courses (role-based visibility)
export const getCourses = async () => {
  const res = await api.get("/courses");
  return res.data;
};

// Create course (teacher/admin)
export const createCourse = async (data) => {
  const res = await api.post("/courses", data);
  return res.data;
};

// Teacher submits course for review
export const submitCourse = async (courseId) => {
  const res = await api.patch(`/courses/${courseId}/submit`);
  return res.data;
};

// Admin updates course status
export const updateCourseStatus = async (courseId, status) => {
  const res = await api.patch(`/courses/${courseId}/status`, {
    status
  });
  return res.data;
};

// Get single course
export const getCourseById = async (courseId) => {
  const res = await api.get(`/courses/${courseId}`);
  return res.data;
};

/* =========================
   MODULE API
========================= */

export const getModulesByCourse = async (courseId) => {
  const res = await api.get(`/modules/course/${courseId}`);
  return res.data;
};

/* =========================
   LESSON API
========================= */

export const getLessonsByModule = async (moduleId) => {
  const res = await api.get(`/lessons/module/${moduleId}`);
  return res.data;
};

/* =========================
   PROGRESS API
========================= */

export const getCourseProgress = async (courseId) => {
  const res = await api.get(`/progress/course/${courseId}`);
  return res.data;
};
export const createModule = async (courseId, title) => {
  const res = await api.post(`/modules`, {
    courseId,
    title
  });
  return res.data;
};

export const createLesson = async (moduleId, lesson) => {
  const res = await api.post(`/lessons`, {
    moduleId,
    ...lesson
  });
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
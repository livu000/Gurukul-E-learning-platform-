import api from './api';


// STUDENT & TEACHER (existing, do not change)

export const getAssignmentsByCourse = async (courseId) => {
  const res = await api.get(`/assignments/course/${courseId}`);
  return res.data;
};

export const getAssignmentById = async (assignmentId) => {
  const res = await api.get(`/assignments/${assignmentId}`);
  return res.data;
};

export const submitAssignment = async (data) => {
  const res = await api.post('/assignments/submit', data);
  return res.data;
};

export const getMySubmissions = async () => {
  const res = await api.get('/assignments/my-submissions');
  return res.data;
};


// TEACHER - create

export const createAssignment = async (data) => {
  const res = await api.post('/assignments', data);
  return res.data;
};

export const updateAssignment = async (assignmentId, data) => {
  const res = await api.patch(`/assignments/${assignmentId}`, data);
  return res.data;
};

export const publishAssignment = async (assignmentId, isPublished = true) => {
  const res = await api.patch(`/assignments/${assignmentId}/publish`, { isPublished });
  return res.data;
};

export const deleteAssignment = async (assignmentId) => {
  const res = await api.delete(`/assignments/${assignmentId}`);
  return res.data;
};


// USED BY old AssignmentSubmissions.jsx (keep)
export const getSubmissions = async (assignmentId) => {
  const res = await api.get(`/assignments/${assignmentId}/submissions`);
  return res.data;
};


// NEW — for improved teacher page

export const getSubmissionsByAssignment = async (assignmentId) => {
  const res = await api.get(`/assignments/${assignmentId}/submissions`);
  return res.data;
};


// OLD grading (keep for GradeSubmission.jsx if used)

export const gradeSubmissionLegacy = async (data) => {
  const res = await api.post('/assignments/grade', data);
  return res.data;
};


// NEW grading (correct REST path)

export const gradeSubmission = async (submissionId, data) => {
  const res = await api.put(
    `/assignments/submissions/${submissionId}/grade`,
    data
  );
  return res.data;
};

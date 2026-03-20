import api from './api';

export const issueCertificate = async (courseId) => {
  const res = await api.post(`/certificates/course/${courseId}/issue`);
  return res.data;
};

export const getMyCertificates = async () => {
  const res = await api.get('/certificates/my');
  return res.data;
};

export const verifyCertificate = async (certificateId) => {
  const res = await api.get(`/certificates/verify/${certificateId}`);
  return res.data;
};

export const downloadCertificate = async (certificateId) => {
  const res = await api.get(`/certificates/${certificateId}/download`, {
    responseType: 'blob'
  });

  return res.data;
};

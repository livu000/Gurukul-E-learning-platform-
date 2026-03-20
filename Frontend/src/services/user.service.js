import api from './api';

export const getUsers = async (params = {}) => {
  const res = await api.get('/users', { params });
  return res.data;
};

export const updateUser = async (userId, data) => {
  const res = await api.patch(`/users/${userId}`, data);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};

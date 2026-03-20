import api from "./api";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const updateUser = async (userId, data) => {
  const res = await api.patch(`/users/${userId}`, data);
  return res.data;
};

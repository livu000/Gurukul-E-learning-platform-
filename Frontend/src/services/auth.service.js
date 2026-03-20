import api from './api';
import { clearAuthSession, getRefreshToken, setAuthSession } from '../utils/session';

export async function login(payload) {
  const res = await api.post('/auth/login', payload);
  if (res.data?.accessToken) {
    setAuthSession(res.data);
  }
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function getSessions() {
  const res = await api.get('/auth/sessions');
  return res.data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } finally {
    clearAuthSession();
  }
}

export async function logoutAll() {
  try {
    await api.post('/auth/logout-all');
  } finally {
    clearAuthSession();
  }
}

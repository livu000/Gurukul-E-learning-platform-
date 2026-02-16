import axios from 'axios';

// ======================================
// AXIOS INSTANCE
// ======================================
const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// ======================================
// REQUEST INTERCEPTOR
// Attach Access Token Automatically
// ======================================
api.interceptors.request.use((config) => {

  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// ======================================
// RESPONSE INTERCEPTOR
// AUTO REFRESH TOKEN SYSTEM
// ======================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config;

    // Only retry once
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        // If no refresh token → force logout
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Request new access token
        const res = await axios.post(
          'http://localhost:4000/api/auth/refresh',
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;

        // Save new token
        localStorage.setItem('accessToken', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {

        console.error('Refresh token failed');

        // Clear session and redirect
        localStorage.clear();
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

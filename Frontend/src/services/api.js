import axios from "axios";
import { clearAuthSession, getAccessToken, getRefreshToken, setAuthSession } from "../utils/session";

/* ======================================
   AXIOS INSTANCE
====================================== */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

/* ======================================
   REQUEST INTERCEPTOR
   Attach Access Token Automatically
====================================== */

api.interceptors.request.use(

  (config) => {

    const accessToken = localStorage.getItem("accessToken");
    const fallbackToken = getAccessToken();

    if (accessToken || fallbackToken) {
      config.headers.Authorization = `Bearer ${accessToken || fallbackToken}`;
    }

    return config;
  },

  (error) => Promise.reject(error)

);

/* ======================================
   RESPONSE INTERCEPTOR
   AUTO REFRESH TOKEN SYSTEM
====================================== */

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      try {

        const refreshToken = getRefreshToken();

        // If refresh token missing → logout
        if (!refreshToken) {

          clearAuthSession();
          window.location.href = "/login";

          return Promise.reject(error);
        }

        // Request new access token
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        setAuthSession({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        });

        // Update header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {

        console.error("Token refresh failed:", refreshError);

        clearAuthSession();
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);

  }

);

export default api;

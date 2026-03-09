import axios from "axios";

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

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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

        const refreshToken = localStorage.getItem("refreshToken");

        // If refresh token missing → logout
        if (!refreshToken) {

          localStorage.clear();
          window.location.href = "/login";

          return Promise.reject(error);
        }

        // Request new access token
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;

        // Store new access token
        localStorage.setItem("accessToken", newAccessToken);

        // Update header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {

        console.error("Token refresh failed:", refreshError);

        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);

  }

);

export default api;
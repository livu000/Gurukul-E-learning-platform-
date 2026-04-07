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

let refreshRequest = null;

function shouldSkipRefresh(url = "") {
  return url.includes("/auth/login") || url.includes("/auth/refresh");
}

async function refreshAuthSession() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  if (!refreshRequest) {
    refreshRequest = axios.post(
      `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/auth/refresh`,
      { refreshToken }
    )
      .then((res) => {
        const newAccessToken = res.data?.accessToken;
        const newRefreshToken = res.data?.refreshToken;

        if (!newAccessToken || !newRefreshToken) {
          throw new Error("Invalid refresh response");
        }

        setAuthSession({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        });

        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        };
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

/* ======================================
   REQUEST INTERCEPTOR
   Attach Access Token Automatically
====================================== */

api.interceptors.request.use(

  (config) => {

    const accessToken = getAccessToken();

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

    const originalRequest = error.config || {};

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {

      originalRequest._retry = true;

      try {
        if (!getRefreshToken()) {

          clearAuthSession();
          window.location.href = "/login";

          return Promise.reject(error);
        }

        const { accessToken: newAccessToken } = await refreshAuthSession();

        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newAccessToken}`
        };

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

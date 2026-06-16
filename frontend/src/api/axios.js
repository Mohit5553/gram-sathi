import axios from 'axios';
import { store } from '../app/store';
import { loginSuccess, logout } from '../redux/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle 401 & Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = store.getState().auth.refreshToken;
      if (refreshToken) {
        try {
          // Attempt to refresh
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken, token } = res.data;
          
          // Update Redux
          store.dispatch(loginSuccess({
            accessToken: accessToken || token,
            refreshToken: newRefreshToken || refreshToken, // fallback to old if not rotated
            user: store.getState().auth.user // Keep existing user
          }));

          processQueue(null, accessToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Refresh failed, logout
          store.dispatch(logout());
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        store.dispatch(logout());
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

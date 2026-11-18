import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8080/api/v1' : '/api/v1');

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshRequest;

const isAuthEndpoint = (url) =>
  ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/google'].includes(url?.split('?')[0]);

const clearStoredSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('currentUser');
  window.dispatchEvent(new Event('auth:session-expired'));
};

const storeAccessToken = (accessToken) => {
  const storage = localStorage.getItem('currentUser') ? localStorage : sessionStorage;
  storage.setItem('accessToken', accessToken);
};

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getRefreshedSession = () => {
  if (!refreshRequest) {
    refreshRequest = refreshClient.post('/auth/refresh', {})
      .then((response) => response.data?.data ?? response.data)
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
};

// Apply this to each API client so every authenticated module shares the refresh flow.
export const applyRefreshInterceptor = (client) => {
  client.interceptors.response.use(
    (res) => res.data?.data ?? res.data,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status !== 401 || !originalRequest || originalRequest._retry
        || isAuthEndpoint(originalRequest.url)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const session = await getRefreshedSession();
        if (!session?.accessToken) {
          throw new Error('Không nhận được access token mới.');
        }

        storeAccessToken(session.accessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        if ([401, 403, 423].includes(refreshError.response?.status)) {
          await refreshClient.post('/auth/logout', {}).catch(() => {});
          clearStoredSession();
        }
        return Promise.reject(error);
      }
    },
  );
  return client;
};

applyRefreshInterceptor(apiClient);

/** Thông báo tiếng Việt từ ApiResponse lỗi, hoặc câu chung khi không gọi được server. */
export const errorMessage = (err) =>
  err?.response?.data?.message ??
  (!err?.response ? 'Không thể kết nối đến máy chủ Backend (port 8080). Vui lòng đảm bảo Backend đang chạy.' : 'Đã có lỗi xảy ra. Vui lòng thử lại.');

export default apiClient;

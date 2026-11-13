import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend trả ApiResponse<T>: lấy thẳng phần data
apiClient.interceptors.response.use((res) => res.data?.data ?? res.data);

/** Thông báo tiếng Việt từ ApiResponse lỗi, hoặc câu chung khi không gọi được server. */
export const errorMessage = (err) =>
  err?.response?.data?.message ?? 'Không kết nối được máy chủ, vui lòng thử lại.';

export default apiClient;

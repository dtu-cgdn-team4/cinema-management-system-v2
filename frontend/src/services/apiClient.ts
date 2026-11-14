import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiEnvelope } from '@/types/auth';

interface ApiErrorBody {
  message?: string;
  data?: unknown;
}

export type ApiClientError = Error & {
  response?: AxiosResponse<ApiErrorBody>;
  status?: number;
  fieldErrors?: Record<string, string>;
};

interface TypedApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiEnvelope<T>>;
  post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiEnvelope<T>>;
}

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((item) => typeof item === 'string');

const normalizeApiError = (error: unknown): ApiClientError => {
  const axiosError = axios.isAxiosError<ApiErrorBody>(error) ? error : null;
  const response = axiosError?.response;
  const errorData = response?.data;
  let message = errorData?.message;

  if (!message) {
    if (!response) {
      message =
        'Không thể kết nối đến máy chủ Backend (port 8080). Vui lòng đảm bảo Backend đang chạy.';
    } else if (response.status === 401) {
      message = 'Tài khoản hoặc mật khẩu không chính xác.';
    } else if (response.status === 403) {
      message = 'Bạn không có quyền truy cập hoặc tài khoản đã bị khóa.';
    } else {
      message = axiosError?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    }
  }

  const customError = new Error(message) as ApiClientError;
  customError.response = response;
  customError.status = response?.status;
  if (isStringRecord(errorData?.data)) {
    customError.fieldErrors = errorData.data;
  }
  return customError;
};

// Ưu tiên VITE_API_BASE_URL từ env, mặc định trỏ đến backend Spring Boot 8080 trong môi trường dev
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8080/api/v1' : '/api/v1');

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true, // Hỗ trợ gửi cookie xác thực cho Google OAuth & CORS
});

// Request interceptor: tự động đính kèm JWT token nếu có
axiosClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý chuẩn hóa phản hồi và lỗi từ Backend
axiosClient.interceptors.response.use(
  (response) => {
    // Backend trả về ApiResponse { code, message, data }
    return response.data as AxiosResponse<unknown>;
  },
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);

const apiClient = axiosClient as unknown as TypedApiClient;

export default apiClient;

import apiClient from '@/services/apiClient';
import type {
  ApiEnvelope,
  GoogleAuthUrl,
  LoginCredentials,
  LoginPayload,
  UserInfo,
} from '@/types/auth';

/**
 * Service gọi API xác thực tài khoản
 */
export const authApi = {
  /** Đăng nhập bằng username / email và mật khẩu. */
  login: (credentials: LoginCredentials) => {
    return apiClient.post<LoginPayload>('/auth/login', credentials);
  },

  /** Đăng nhập bằng Google ID Token. */
  loginWithGoogle: (idToken: string) => {
    return apiClient.post<LoginPayload>('/auth/google', { idToken });
  },

  /**
   * Lấy URL chuyển hướng đăng nhập Google
   */
  getGoogleAuthUrl: () => {
    return apiClient.get<GoogleAuthUrl>('/auth/google/url');
  },

  /** Hoàn tất đăng nhập Google bằng cookie callback HttpOnly. */
  exchangeGoogleLogin: () => {
    return apiClient.post<LoginPayload>('/auth/google/exchange');
  },

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  getCurrentUser: (): Promise<ApiEnvelope<UserInfo>> => {
    return apiClient.get<UserInfo>('/auth/me');
  },
};

export default authApi;


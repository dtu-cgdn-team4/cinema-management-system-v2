import apiClient from '@/services/apiClient';

/**
 * Service gọi API xác thực tài khoản
 */
export const authApi = {
  /** Đăng nhập bằng username / email và mật khẩu. */
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  /** Đăng nhập bằng Google ID Token. */
  loginWithGoogle: (idToken) => {
    return apiClient.post('/auth/google', { idToken });
  },

  /**
   * Lấy URL chuyển hướng đăng nhập Google
   */
  getGoogleAuthUrl: () => {
    return apiClient.get('/auth/google/url');
  },

  /** Hoàn tất đăng nhập Google bằng cookie callback HttpOnly. */
  exchangeGoogleLogin: () => {
    return apiClient.post('/auth/google/exchange');
  },

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  getCurrentUser: () => {
    return apiClient.get('/auth/me');
  },
};

export default authApi;

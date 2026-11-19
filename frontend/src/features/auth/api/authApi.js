import apiClient from '../../../services/apiClient';

export const checkRegisterAvailability = ({ username, email, phoneNumber }) =>
  apiClient.post('/auth/register/availability', {
    username: username?.trim(),
    email: email?.trim().toLowerCase(),
    phoneNumber: phoneNumber?.trim(),
  });

/**
 * Gửi dữ liệu đã chuẩn hóa đến endpoint đăng ký khách hàng.
 * confirmPassword và termsAccepted chỉ phục vụ kiểm tra ở trình duyệt; idCard/address chỉ gửi khi có giá trị.
 * API đăng ký không tự đăng nhập người dùng hay trả token phiên làm việc.
 */
export const registerCustomer = ({
  username,
  fullName,
  email,
  phoneNumber,
  firebaseIdToken,
  dateOfBirth,
  gender,
  password,
  idCard,
  address,
}) => {
  const payload = {
    username: username?.trim(),
    fullName: fullName?.trim(),
    email: email?.trim().toLowerCase(),
    phoneNumber: phoneNumber?.trim(),
    firebaseIdToken,
    dateOfBirth,
    gender,
    password,
  };

  const trimmedIdCard = idCard?.trim();
  if (trimmedIdCard) {
    payload.idCard = trimmedIdCard;
  }

  const trimmedAddress = address?.trim();
  if (trimmedAddress) {
    payload.address = trimmedAddress;
  }

  return apiClient.post('/auth/register', payload);
};

/**
 * Service gọi API xác thực tài khoản & đăng nhập
 */
export const authApi = {
  /** Đăng ký khách hàng mới */
  registerCustomer,

  /** Đăng nhập bằng username / email và mật khẩu. */
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  /** Đăng nhập bằng Google ID Token. */
  loginWithGoogle: (idToken, rememberMe = true) => {
    return apiClient.post('/auth/google', { idToken, rememberMe });
  },

  /**
   * Lấy URL chuyển hướng đăng nhập Google
   */
  getGoogleAuthUrl: (rememberMe = true) => {
    return apiClient.get('/auth/google/url', { params: { rememberMe } });
  },

  /** Revoke the current refresh token and clear its HttpOnly cookie. */
  logout: () => apiClient.post('/auth/logout'),

  /** Lấy access token sau Google OAuth bằng refresh cookie HttpOnly. */
  exchangeGoogleLogin: () => {
    return apiClient.post('/auth/refresh');
  },

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  getCurrentUser: () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Bổ sung thông tin bắt buộc (SĐT, Ngày sinh, Giới tính) cho tài khoản
   */
  completeProfile: (data) => {
    return apiClient.post('/auth/complete-profile', data);
  },
};

export const completeProfile = (data) => {
  return apiClient.post('/auth/complete-profile', data);
};

export default authApi;

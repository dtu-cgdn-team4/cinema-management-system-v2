import apiClient from '../../../services/apiClient';

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

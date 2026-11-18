import apiClient from '@/services/apiClient';

/**
 * Lấy thông tin hồ sơ của tài khoản đang đăng nhập.
 * @returns {Promise<Object>}
 */
export const getAccountProfile = () => apiClient.get('/account/me');

/**
 * Cập nhật thông tin hồ sơ cá nhân.
 * Hợp đồng API cho phép: email, phoneNumber, fullName, dateOfBirth, gender, citizenId, address.
 * Tuyệt đối không gửi userId, username, loyaltyPoints hoặc các trường ngoài hợp đồng.
 *
 * @param {Object} data
 * @param {string} [data.email]
 * @param {string} [data.phoneNumber]
 * @param {string} [data.fullName]
 * @param {string|null} [data.dateOfBirth]
 * @param {string|null} [data.gender]
 * @param {string|null} [data.citizenId]
 * @param {string|null} [data.address]
 * @returns {Promise<import('../types').AccountProfile>}
 */
export const updateAccountProfile = (data) => {
  // Chỉ gửi các trường API cho phép khi được cung cấp; bỏ qua trường không truyền lên.
  const payload = {};

  if (data.email !== undefined) {
    payload.email = data.email;
  }
  if (data.phoneNumber !== undefined) {
    payload.phoneNumber = data.phoneNumber;
  }
  if (data.fullName !== undefined) {
    payload.fullName = data.fullName.trim();
  }
  if (data.dateOfBirth !== undefined) {
    payload.dateOfBirth = data.dateOfBirth ? data.dateOfBirth : null;
  }
  if (data.gender !== undefined) {
    payload.gender = data.gender ? data.gender : null;
  }
  if (data.citizenId !== undefined) {
    payload.citizenId = data.citizenId ? data.citizenId.trim() : null;
  }
  if (data.address !== undefined) {
    payload.address = data.address ? data.address.trim() : null;
  }

  return apiClient.patch('/account/me', payload);
};

/**
 * Đổi mật khẩu của tài khoản đang đăng nhập.
 * Request body chỉ chứa 3 trường: currentPassword, newPassword, confirmPassword.
 * Không kèm userId hoặc trường ngoài hợp đồng.
 *
 * @param {Object} param
 * @param {string} param.currentPassword
 * @param {string} param.newPassword
 * @param {string} param.confirmPassword
 * @returns {Promise<{code: number, message: string}>}
 */
export const changeAccountPassword = ({ currentPassword, newPassword, confirmPassword }) => {
  return apiClient.put('/account/me/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
};

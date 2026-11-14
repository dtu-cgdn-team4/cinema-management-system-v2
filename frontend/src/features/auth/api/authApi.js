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

/**
 * Đổi số Việt Nam bắt đầu bằng 0 sang E.164 vì Firebase Phone Auth yêu cầu định dạng quốc tế.
 * Ví dụ: "0901234567" thành "+84901234567".
 */
export function toE164VietnamesePhone(phoneNumber) {
  if (!phoneNumber) return '';
  const trimmed = String(phoneNumber).trim();
  if (trimmed.startsWith('+84')) {
    return trimmed;
  }
  if (trimmed.startsWith('0')) {
    return '+84' + trimmed.slice(1);
  }
  return trimmed;
}

/**
 * Thêm khoảng trắng để số điện thoại dễ đọc trong phần xác nhận OTP.
 */
export function formatDisplayPhone(phoneNumber) {
  if (!phoneNumber) return '';
  const digits = String(phoneNumber).replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phoneNumber;
}

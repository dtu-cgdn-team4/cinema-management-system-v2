/**
 * Tính tuổi chính xác dựa trên chuỗi ngày sinh ('YYYY-MM-DD' hoặc 'DD / MM / YYYY') và ngày hiện tại.
 */
export function calculateAge(dateOfBirthString, referenceDate = new Date()) {
  if (!dateOfBirthString || typeof dateOfBirthString !== 'string') return null;
  const str = dateOfBirthString.trim();
  let year, month, day;

  if (str.includes('/')) {
    const parts = str.split('/').map((p) => p.trim());
    if (parts.length !== 3) return null;
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
  } else if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else {
    return null;
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const birthDate = new Date(year, month, day);
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month ||
    birthDate.getDate() !== day
  ) {
    return null;
  }

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const m = referenceDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Đếm số byte UTF-8 của chuỗi ký tự.
 * BCrypt backend giới hạn tối đa 72 byte.
 */
export function getUtf8ByteLength(str) {
  if (!str) return 0;
  return new TextEncoder().encode(str).length;
}

/**
 * Kiểm tra dữ liệu đăng ký phía trình duyệt trước khi bắt đầu xác thực OTP.
 * @param {object} formData Dữ liệu hiện tại của biểu mẫu.
 * @returns {{ isValid: boolean, errors: Record<string, string> }} Kết quả và lỗi theo tên trường.
 */
export function validateRegisterForm(formData = {}) {
  const errors = {};

  // Các nhánh kiểm tra giữ thứ tự ưu tiên lỗi hiện tại cho từng trường.
  const username = formData.username?.trim() ?? '';
  if (!username) {
    errors.username = 'Vui lòng nhập tài khoản.';
  } else if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
    errors.username = 'Tên đăng nhập phải có 3-30 ký tự chữ, số hoặc dấu gạch dưới.';
  }

  const fullName = formData.fullName?.trim() ?? '';
  if (!fullName) {
    errors.fullName = 'Vui lòng nhập họ và tên.';
  } else if (fullName.length < 2 || fullName.length > 150) {
    errors.fullName = 'Họ và tên phải có 2-150 ký tự.';
  }

  const email = formData.email?.trim() ?? '';
  if (!email) {
    errors.email = 'Vui lòng nhập email.';
  } else if (email.length > 254) {
    errors.email = 'Email quá dài.';
  } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    errors.email = 'Email không đúng định dạng.';
  }

  const dateOfBirth = formData.dateOfBirth?.trim() ?? '';
  if (!dateOfBirth) {
    errors.dateOfBirth = 'Vui lòng nhập ngày sinh.';
  } else {
    const age = calculateAge(dateOfBirth);
    if (age === null || isNaN(age)) {
      errors.dateOfBirth = 'Ngày sinh không hợp lệ.';
    } else if (age < 13 || age > 120) {
      errors.dateOfBirth = 'Tuổi phải từ 13 đến 120.';
    }
  }

  const gender = formData.gender?.trim() ?? '';
  if (!gender) {
    errors.gender = 'Vui lòng chọn giới tính.';
  } else if (!['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
    errors.gender = 'Giới tính không hợp lệ.';
  }

  // CMND/CCCD và địa chỉ không bắt buộc; chỉ kiểm tra khi người dùng đã nhập.
  const idCard = formData.idCard?.trim() ?? '';
  if (idCard && !/^(?:[0-9]{9}|[0-9]{12})$/.test(idCard)) {
    errors.idCard = 'CMND/CCCD phải gồm 9 hoặc 12 số.';
  }

  const phoneNumber = formData.phoneNumber?.trim() ?? '';
  if (!phoneNumber) {
    errors.phoneNumber = 'Vui lòng nhập SĐT.';
  } else if (!/^0[35789][0-9]{8}$/.test(phoneNumber)) {
    errors.phoneNumber = 'SĐT phải có 10 chữ số.';
  }

  const address = formData.address?.trim() ?? '';
  if (address) {
    if (address.length < 5) {
      errors.address = 'Địa chỉ phải có ít nhất 5 ký tự.';
    } else if (address.length > 255) {
      errors.address = 'Địa chỉ không được vượt quá 255 ký tự.';
    }
  }

  // Backend dùng BCrypt nên cần giới hạn byte UTF-8 trước khi kiểm tra độ dài và độ phức tạp.
  const password = formData.password ?? '';
  if (!password) {
    errors.password = 'Vui lòng nhập mật khẩu.';
  } else if (getUtf8ByteLength(password) > 72) {
    errors.password = 'Mật khẩu không được vượt quá 72 byte.';
  } else if (password.length < 8) {
    errors.password = 'Mật khẩu cần tối thiểu 8 ký tự.';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}/.test(password)) {
    errors.password = 'Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.';
  }

  // Mật khẩu xác nhận phải trùng nguyên văn với mật khẩu đã nhập.
  const confirmPassword = formData.confirmPassword ?? '';
  if (!confirmPassword) {
    errors.confirmPassword = 'Vui lòng nhập lại mật khẩu.';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp.';
  }

  // Người dùng phải đồng ý điều khoản trước khi gửi đăng ký.
  if (!formData.termsAccepted) {
    errors.termsAccepted = 'Bạn cần đồng ý với điều khoản để đăng ký.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

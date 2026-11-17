/**
 * Đếm byte UTF-8 vì BCrypt chỉ xử lý tối đa 72 byte mật khẩu, không phải 72 ký tự.
 * @param {string} str
 * @returns {number}
 */
export const getUtf8ByteLength = (str) => {
  if (!str) return 0;
  return new TextEncoder().encode(str).length;
};

/**
 * Tính tuổi từ ngày sinh dạng YYYY-MM-DD/ISO; trả null nếu trình duyệt không phân tích được chuỗi.
 * @param {string} dobString
 * @returns {number|null}
 */
export const calculateAge = (dobString) => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Lấy chữ cái viết tắt đại diện (Avatar Initials) từ họ tên.
 * Ví dụ: "Nguyễn Văn An" -> "NA", "An" -> "AN", rỗng -> "U"
 * @param {string} name
 * @returns {string}
 */
export const getAvatarInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Kiểm tra tính hợp lệ của form cập nhật hồ sơ cá nhân.
 * @param {Object} form
 * @param {string} form.fullName
 * @param {string} [form.dateOfBirth]
 * @param {string} [form.gender]
 * @param {string} [form.citizenId]
 * @param {string} [form.address]
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export const validateProfileForm = (form) => {
  const errors = {};

  // Họ tên: bắt buộc, 2-150 ký tự
  const rawFullName = form.fullName;
  if (!rawFullName || !rawFullName.trim()) {
    errors.fullName = 'Họ và tên không được để trống.';
  } else {
    const trimmed = rawFullName.trim();
    if (trimmed.length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
    } else if (trimmed.length > 150) {
      errors.fullName = 'Họ và tên phải có 2-150 ký tự.';
    }
  }

  // Ngày sinh: tùy chọn, nếu có thì tuổi 13-120
  if (form.dateOfBirth) {
    const isoDate = dmyToIso(form.dateOfBirth);
    const age = isoDate ? calculateAge(isoDate) : null;
    if (age === null) {
      errors.dateOfBirth = 'Ngày sinh không hợp lệ.';
    } else if (age < 13 || age > 120) {
      errors.dateOfBirth = 'Tuổi phải từ 13 đến 120.';
    }
  }

  // Giới tính: tùy chọn, MALE | FEMALE | OTHER
  if (form.gender) {
    const g = String(form.gender).trim().toUpperCase();
    if (!['MALE', 'FEMALE', 'OTHER'].includes(g)) {
      errors.gender = 'Giới tính không hợp lệ.';
    }
  }

  // CMND/CCCD: tùy chọn, 9 hoặc 12 số
  if (form.citizenId && form.citizenId.trim()) {
    const cid = form.citizenId.trim();
    if (!/^[0-9]{9}$|^[0-9]{12}$/.test(cid)) {
      errors.citizenId = 'CMND/CCCD phải gồm 9 hoặc 12 số.';
    }
  }

  // Địa chỉ: tùy chọn, 5-255 ký tự
  if (form.address && form.address.trim()) {
    const addr = form.address.trim();
    if (addr.length < 5) {
      errors.address = 'Địa chỉ phải có ít nhất 5 ký tự.';
    } else if (addr.length > 255) {
      errors.address = 'Địa chỉ không được vượt quá 255 ký tự.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Kiểm tra tính hợp lệ của form đổi mật khẩu.
 * @param {Object} form
 * @param {string} form.currentPassword
 * @param {string} form.newPassword
 * @param {string} form.confirmPassword
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export const validatePasswordForm = (form) => {
  const errors = {};

  if (!form.currentPassword) {
    errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
  }

  const newPass = form.newPassword;
  if (!newPass) {
    errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
  } else {
    // Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số, tối đa 72 byte UTF-8
    const hasLower = /[a-z]/.test(newPass);
    const hasUpper = /[A-Z]/.test(newPass);
    const hasDigit = /[0-9]/.test(newPass);
    const byteLength = getUtf8ByteLength(newPass);

    // Array.from đếm ký tự Unicode đầy đủ, khớp với codePointCount của Java ở Backend.
    if (Array.from(newPass).length < 8 || !hasLower || !hasUpper || !hasDigit) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và chữ số.';
    } else if (byteLength > 72) {
      errors.newPassword = 'Mật khẩu mới không được vượt quá 72 byte UTF-8.';
    } else if (form.currentPassword && newPass === form.currentPassword) {
      errors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại.';
    }
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
  } else if (newPass && form.confirmPassword !== newPass) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Chuyển YYYY-MM-DD sang DD/MM/YYYY bằng chuỗi để tránh lệch ngày do múi giờ trình duyệt.
 * @param {string} isoDate
 * @returns {string}
 */
export const isoToDmy = (isoDate) => {
  if (!isoDate || typeof isoDate !== 'string') return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  if (!year || !month || !day) return isoDate;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

/**
 * Chuẩn hóa ngày DD/MM/YYYY hoặc YYYY-MM-DD thành ISO; từ chối ngày không tồn tại.
 * @param {string} dmyDate
 * @returns {string|null}
 */
export const dmyToIso = (dmyDate) => {
  if (!dmyDate || typeof dmyDate !== 'string') return null;
  const trimmed = dmyDate.trim();
  if (!trimmed) return null;
  let year;
  let month;
  let day;
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (isoMatch) {
    [, year, month, day] = isoMatch;
  } else if (dmyMatch) {
    [, day, month, year] = dmyMatch;
  } else {
    return null;
  }

  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const isLeapYear = numericYear % 4 === 0 && (numericYear % 100 !== 0 || numericYear % 400 === 0);
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Kiểm tra số ngày trước khi đổi định dạng để không nhận ngày như 31/02.
  if (numericMonth < 1 || numericMonth > 12 || numericDay < 1 || numericDay > daysInMonth[numericMonth - 1]) {
    return null;
  }

  month = String(numericMonth).padStart(2, '0');
  day = String(numericDay).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

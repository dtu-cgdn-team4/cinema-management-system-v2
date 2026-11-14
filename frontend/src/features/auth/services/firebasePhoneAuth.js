import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { toE164VietnamesePhone } from '../utils/phoneUtils';

let activeRecaptchaVerifier = null;

/**
 * Tạo verifier reCAPTCHA vô hình để Firebase cho phép gửi SMS xác minh.
 * @param {string} containerId - ID của phần tử DOM chứa reCAPTCHA.
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {
      // Verifier cũ có thể đã bị Firebase dọn; vẫn tiếp tục tạo verifier mới.
    }
    activeRecaptchaVerifier = null;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Không tìm thấy phần tử DOM với id '${containerId}' để cấu hình reCAPTCHA.`);
  }

  activeRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // Firebase tiếp tục gửi SMS sau khi reCAPTCHA xác minh thành công.
    },
    'expired-callback': () => {
      // Lần gửi tiếp theo sẽ tạo verifier mới để người dùng xác minh lại.
    },
  });

  return activeRecaptchaVerifier;
}

/**
 * Giải phóng widget để tránh giữ verifier cũ sau khi rời trang.
 */
export function clearRecaptcha() {
  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {
      // Không chặn việc rời trang nếu widget đã được Firebase dọn trước đó.
    }
    activeRecaptchaVerifier = null;
  }
}

/**
 * Chuyển mã lỗi Firebase thường gặp thành thông báo tiếng Việt hiển thị cho người dùng.
 */
export function formatFirebasePhoneError(error) {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Số điện thoại không hợp lệ đối với hệ thống xác thực.';
    case 'auth/too-many-requests':
      return 'Quá nhiều yêu cầu gửi mã trong thời gian ngắn. Vui lòng đợi ít phút trước khi thử lại.';
    case 'auth/invalid-verification-code':
      return 'Mã OTP không chính xác. Vui lòng kiểm tra và nhập lại.';
    case 'auth/code-expired':
      return 'Mã OTP đã hết hạn. Vui lòng bấm "Gửi lại mã" để nhận mã mới.';
    case 'auth/quota-exceeded':
      return 'Hạn mức gửi tin nhắn xác thực tạm thời bị gián đoạn. Vui lòng thử lại sau.';
    case 'auth/captcha-check-failed':
      return 'Xác thực bảo mật reCAPTCHA không thành công. Vui lòng tải lại trang và thử lại.';
    case 'auth/network-request-failed':
      return 'Không thể kết nối đến máy chủ xác thực Firebase. Vui lòng kiểm tra kết nối mạng.';
    default:
      return error?.message || 'Có lỗi xảy ra trong quá trình xác thực OTP qua số điện thoại.';
  }
}

/**
 * Gửi OTP bằng Firebase Phone Authentication sau khi chuyển số Việt Nam sang E.164.
 * @param {string} phoneNumber
 * @param {string} containerId
 * @returns {Promise<import('firebase/auth').ConfirmationResult>}
 */
export async function sendPhoneOtp(phoneNumber, containerId = 'recaptcha-container') {
  const e164Phone = toE164VietnamesePhone(phoneNumber);
  const verifier = setupRecaptcha(containerId);
  return await signInWithPhoneNumber(auth, e164Phone, verifier);
}

/**
 * Xác minh OTP; backend dùng ID token trả về để xác nhận số điện thoại.
 * @param {import('firebase/auth').ConfirmationResult} confirmationResult
 * @param {string} otpCode
 * @returns {Promise<string>} firebaseIdToken
 */
export async function verifyPhoneOtp(confirmationResult, otpCode) {
  if (!confirmationResult || typeof confirmationResult.confirm !== 'function') {
    throw new Error('Phiên xác thực OTP không hợp lệ hoặc đã kết thúc. Vui lòng gửi lại mã.');
  }
  const cleanCode = String(otpCode).trim();
  const userCredential = await confirmationResult.confirm(cleanCode);
  const idToken = await userCredential.user.getIdToken();
  return idToken;
}

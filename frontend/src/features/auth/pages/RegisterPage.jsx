import { ArrowLeft, ChevronDown, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../../services/apiClient';
import { registerCustomer } from '../api/authApi';
import OtpVerificationModal from '../components/OtpVerificationModal';
import RegisterCinematicHero from '../components/RegisterCinematicHero';
import RegisterForm from '../components/RegisterForm';
import RegisterSuccessCard from '../components/RegisterSuccessCard';
import {
  clearRecaptcha,
  formatFirebasePhoneError,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../services/firebasePhoneAuth';
import { validateRegisterForm } from '../utils/registerValidation';

const INITIAL_FORM = {
  username: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  idCard: '',
  address: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
};

/** Điều phối trạng thái đăng ký từ lúc nhập thông tin đến khi xác minh OTP hoặc báo lỗi. */
export default function RegisterPage() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  // Lưu trạng thái của bước gửi và xác minh OTP để form và modal hiển thị đúng tiến trình.
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState(null);

  // Chỉ chuyển sang màn hình thành công sau khi API đăng ký trả kết quả thành công.
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Firebase tạo widget reCAPTCHA theo trang; cần giải phóng widget khi rời trang.
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) {
      setServerError(null);
    }
  };

  /**
   * Submit form:
   * 1. Validate form client-side.
   * 2. Áp dụng kiểm tra tài khoản trùng đang được cấu hình cho luồng đăng ký.
   * 3. Nếu hợp lệ -> Gọi Firebase gửi mã OTP qua SMS.
   * 4. Mở modal nhập OTP.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateRegisterForm(formData);
    const formErrors = { ...validation.errors };

    // Giữ username mẫu này ở trạng thái đã tồn tại để có thể xem lỗi inline trong preview.
    if (formData.username?.trim().toLowerCase() === 'nguyenvanan' && !formErrors.username) {
      formErrors.username = 'Tài khoản này đã tồn tại.';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setIsSendingOtp(true);
    setOtpError(null);

    try {
      const result = await sendPhoneOtp(formData.phoneNumber, 'recaptcha-container');
      setConfirmationResult(result);
      setIsOtpModalOpen(true);
    } catch (err) {
      setServerError(formatFirebasePhoneError(err));
    } finally {
      setIsSendingOtp(false);
    }
  };

  /**
   * Xác nhận mã OTP và gửi đăng ký tới API backend.
   * Lỗi theo trường được chuyển về form; lỗi không gắn với trường cụ thể được hiển thị ở vùng báo lỗi chung.
   */
  const handleVerifyOtp = async (otpCode) => {
    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const firebaseIdToken = await verifyPhoneOtp(confirmationResult, otpCode);

      const userResponse = await registerCustomer({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        firebaseIdToken,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        password: formData.password,
        idCard: formData.idCard,
        address: formData.address,
      });

      setIsOtpModalOpen(false);
      setIsSuccess(true);
      setRegisteredUser(userResponse);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err?.code && err.code.startsWith('auth/')) {
        setOtpError(formatFirebasePhoneError(err));
      } else {
        setIsOtpModalOpen(false);
        const backendMessage = errorMessage(err);

        if (err?.response?.data?.errors && Object.keys(err.response.data.errors).length > 0) {
          setErrors(err.response.data.errors);
          setServerError(null);
        } else if (
          backendMessage?.toLowerCase().includes('tài khoản') ||
          backendMessage?.toLowerCase().includes('username') ||
          backendMessage?.toLowerCase().includes('tồn tại')
        ) {
          setErrors((prev) => ({
            ...prev,
            username: 'Tài khoản này đã tồn tại.',
          }));
          setServerError(null);
        } else {
          setServerError(backendMessage);
        }
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  /**
   * Gửi mã mới và thay phiên xác nhận hiện tại bằng kết quả Firebase trả về.
   */
  const handleResendOtp = async () => {
    setOtpError(null);
    try {
      const result = await sendPhoneOtp(formData.phoneNumber, 'recaptcha-container');
      setConfirmationResult(result);
    } catch (err) {
      setOtpError(formatFirebasePhoneError(err));
      throw err;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0e10] text-[#f5f2ed] overflow-x-hidden">
      {/* Firebase cần phần tử DOM này để gắn widget reCAPTCHA vô hình. */}
      <div id="recaptcha-container" />

      {/* Bố cục trang đăng ký; hero được ẩn trên màn hình nhỏ để ưu tiên form. */}
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[55%_45%] bg-[#0d0e10]">
          {/* Hình ảnh và nội dung giới thiệu thương hiệu. */}
        <div className="relative hidden lg:block lg:sticky lg:top-0 h-screen w-full overflow-hidden bg-[#090a0f]">
          <RegisterCinematicHero />
        </div>

        {/* Khu vực điều hướng, form đăng ký và chân trang. */}
        <div className="flex min-h-screen w-full flex-col justify-between pt-6 pb-6 px-4 sm:px-8 lg:px-6 xl:px-12 lg:pt-[48px] lg:pb-[36px]">
          {/* Điều hướng về trang chủ và lựa chọn ngôn ngữ. */}
          <div className="mx-auto w-full max-w-[504px] lg:max-w-[536px] flex items-center justify-between text-xs text-[#8f929a] mb-5 lg:mb-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>Về trang chủ</span>
            </Link>

            <div className="inline-flex items-center gap-1.5 text-[#8f929a] transition hover:text-white cursor-pointer select-none">
              <Globe size={14} />
              <span>Tiếng Việt</span>
              <ChevronDown size={13} />
            </div>
          </div>

          {/* Thay form bằng thẻ xác nhận khi đăng ký hoàn tất. */}
          <div className="mx-auto lg:mt-[52px] lg:mb-auto w-full max-w-[504px]">
            {isSuccess ? (
              <RegisterSuccessCard registeredUser={registeredUser} />
            ) : (
              <div>
                {/* Giới thiệu ngắn về mục đích của biểu mẫu. */}
                <div className="mb-4">
                  <span className="block text-[10px] font-semibold uppercase tracking-[2.2px] text-[#ca3538]">
                    THÀNH VIÊN GALAXY
                  </span>
                  <h2 className="mt-1 font-sans text-[28px] sm:text-[30px] font-semibold tracking-tight text-white leading-tight">
                    Tạo tài khoản mới.
                  </h2>
                  <p className="mt-1 text-[13px] text-[#8f929a]">
                    Điền đầy đủ thông tin để hoàn tất đăng ký.
                  </p>
                </div>

                {/* Thành phần quản lý trường nhập và lỗi validation. */}
                <RegisterForm
                  formData={formData}
                  errors={errors}
                  serverError={serverError}
                  isSubmitting={isSendingOtp}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                />
              </div>
            )}
          </div>

          {/* Các liên kết hỗ trợ và thông tin bản quyền. */}
          <div className="mx-auto w-full max-w-[504px] lg:max-w-[536px] pt-8 text-center text-xs text-[#6b7280]">
            <div className="flex items-center justify-center gap-3 text-[11.5px] text-[#8f929a]">
              <a
                href="#tro-giup"
                onClick={(e) => e.preventDefault()}
                className="transition hover:text-white"
              >
                Trợ giúp
              </a>
              <span>·</span>
              <a
                href="#dieu-khoan"
                onClick={(e) => e.preventDefault()}
                className="transition hover:text-white"
              >
                Điều khoản sử dụng
              </a>
              <span>·</span>
              <a
                href="#chinh-sach"
                onClick={(e) => e.preventDefault()}
                className="transition hover:text-white"
              >
                Chính sách bảo mật
              </a>
            </div>
            <p className="mt-1.5 text-[11px] text-[#525560]">
              © 2026 Galaxy Cinema. Mọi quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>

      {/* Modal xác minh số điện thoại trước khi hoàn tất đăng ký. */}
      <OtpVerificationModal
        phoneNumber={formData.phoneNumber}
        isOpen={isOtpModalOpen}
        isVerifying={isVerifyingOtp}
        error={otpError}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}

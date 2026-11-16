import { ArrowLeft, ChevronDown, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../../../services/apiClient';
import { checkRegisterAvailability, registerCustomer } from '../api/authApi';
import RegisterCinematicHero from '../components/RegisterCinematicHero';
import RegisterForm from '../components/RegisterForm';
import RegisterOtpStep from '../components/RegisterOtpStep';
import {
  clearRecaptcha,
  formatFirebasePhoneError,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../services/firebasePhoneAuth';
import { toIsoDateString, validateRegisterForm } from '../utils/registerValidation';

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

/** Điều phối trạng thái đăng ký từ lúc nhập thông tin đến khi xác minh OTP SMS hoặc báo lỗi. */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  // Hỗ trợ kiểm thử trực quan 6 trạng thái OTP Figma khi có query param ?previewState=...
  const previewState = import.meta.env.DEV && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('previewState')
    : null;

  // Điều hướng giữa bước điền Form ('FORM') và bước nhập OTP SMS ('OTP') trong cột phải
  const [currentStep, setCurrentStep] = useState(previewState ? 'OTP' : 'FORM');

  // Trạng thái gửi và xác minh OTP qua Firebase
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(previewState === 'VERIFYING');
  const [otpError, setOtpError] = useState(
    previewState === 'WRONG_CODE' ? 'Mã OTP không chính xác. Vui lòng thử lại.' : null
  );

  // Trạng thái hoàn tất sau khi backend tạo tài khoản thành công
  const [isSuccess, setIsSuccess] = useState(previewState === 'SUCCESS');

  // Báo thành công ngắn rồi tự chuyển sang đăng nhập; không ảnh hưởng preview Figma.
  useEffect(() => {
    if (!isSuccess || previewState === 'SUCCESS') return undefined;

    const redirectTimer = window.setTimeout(() => {
      navigate('/dang-nhap', { replace: true });
    }, 1500);

    return () => window.clearTimeout(redirectTimer);
  }, [isSuccess, navigate, previewState]);

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
   * 4. Khi Firebase gửi OTP thành công -> Chuyển cột phải sang giao diện OTP toàn trang.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateRegisterForm(formData);
    const formErrors = { ...validation.errors };

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setIsSendingOtp(true);
    setOtpError(null);

    try {
      // Chặn dữ liệu đã đăng ký trước khi gọi Firebase gửi OTP.
      const availability = await checkRegisterAvailability(formData);
      if (!availability.available) {
        setErrors(availability.errors);
        return;
      }

      const result = await sendPhoneOtp(formData.phoneNumber, 'recaptcha-container');
      setConfirmationResult(result);
      setCurrentStep('OTP');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err?.code && err.code.startsWith('auth/')) {
        setServerError(formatFirebasePhoneError(err));
      } else if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(errorMessage(err));
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  /**
   * Xác nhận mã OTP với Firebase, sau đó gửi payload đăng ký tới API backend.
   * Chỉ khi cả Firebase và Backend thành công, mới hiển thị trạng thái hoàn tất (Màn 6 Figma).
   * Nếu backend lỗi sau khi Firebase xác thực: không hiển thị thành công, báo lỗi rõ ràng.
   */
  const handleVerifyOtp = async (otpCode) => {
    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      // 1. Xác thực OTP qua Firebase Phone Auth lấy ID token
      const firebaseIdToken = await verifyPhoneOtp(confirmationResult, otpCode);

      // 2. Gửi yêu cầu tạo tài khoản tới backend (chuẩn hóa dateOfBirth sang ISO YYYY-MM-DD cho backend)
      await registerCustomer({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        firebaseIdToken,
        dateOfBirth: toIsoDateString(formData.dateOfBirth),
        gender: formData.gender,
        password: formData.password,
        idCard: formData.idCard,
        address: formData.address,
      });

      // 3. Đăng ký backend thành công -> Chuyển sang màn hoàn tất (Màn 6)
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err?.code && err.code.startsWith('auth/')) {
        // Lỗi xác thực mã OTP từ Firebase (sai mã, hết hạn...)
        setOtpError(formatFirebasePhoneError(err));
      } else {
        // Lỗi phản hồi từ backend API sau khi Firebase verify thành công
        const backendMessage = errorMessage(err);
        setOtpError(backendMessage);

        if (err?.response?.data?.errors && Object.keys(err.response.data.errors).length > 0) {
          setErrors(err.response.data.errors);
        } else if (
          backendMessage?.toLowerCase().includes('tài khoản') ||
          backendMessage?.toLowerCase().includes('username') ||
          backendMessage?.toLowerCase().includes('tồn tại')
        ) {
          setErrors((prev) => ({
            ...prev,
            username: 'Tài khoản này đã tồn tại.',
          }));
        } else if (
          backendMessage?.toLowerCase().includes('email')
        ) {
          setErrors((prev) => ({
            ...prev,
            email: 'Email này đã được sử dụng.',
          }));
        } else if (
          backendMessage?.toLowerCase().includes('điện thoại') ||
          backendMessage?.toLowerCase().includes('phone')
        ) {
          setErrors((prev) => ({
            ...prev,
            phoneNumber: 'Số điện thoại này đã được sử dụng.',
          }));
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
      const msg = formatFirebasePhoneError(err);
      setOtpError(msg);
      throw new Error(msg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0e10] text-[#f5f2ed] overflow-x-hidden">
      {/* Firebase cần phần tử DOM này để gắn widget reCAPTCHA vô hình. */}
      <div id="recaptcha-container" />

      {/* Bố cục trang đăng ký split layout 55% / 45% theo đúng thiết kế Figma (1440 × 1280). */}
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[55%_45%] bg-[#0d0e10]">
        {/* Cột trái (55%): Cinematic Hero giới thiệu thương hiệu */}
        <div className="relative hidden lg:block lg:sticky lg:top-0 h-screen w-full overflow-hidden bg-[#090a0f]">
          <RegisterCinematicHero />
        </div>

        {/* Cột phải (45%): Form đăng ký HOẶC Giao diện OTP toàn trang */}
        {currentStep === 'OTP' ? (
          <RegisterOtpStep
            phoneNumber={formData.phoneNumber || '0901234521'}
            isVerifying={isVerifyingOtp}
            isSuccess={isSuccess}
            error={otpError}
            initialDigits={
              previewState === 'TYPING'
                ? ['1', '2', '3', '', '', '']
                : previewState === 'WRONG_CODE' || previewState === 'VERIFYING' || previewState === 'SUCCESS'
                ? ['1', '2', '3', '4', '5', '6']
                : null
            }
            initialCountdown={
              previewState === 'EXPIRED'
                ? 0
                : previewState === 'WRONG_CODE'
                ? 72
                : previewState === 'TYPING'
                ? 94
                : 120
            }
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onBackToForm={() => {
              setCurrentStep('FORM');
              setOtpError(null);
            }}
          />
        ) : (
          <div className="flex min-h-screen w-full flex-col justify-between pt-6 pb-6 px-4 sm:px-8 lg:px-6 xl:px-12 lg:pt-[48px] lg:pb-[36px]">
            {/* Điều hướng về trang chủ và lựa chọn ngôn ngữ */}
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

            {/* Nội dung form đăng ký */}
            <div className="mx-auto lg:mt-[52px] lg:mb-auto w-full max-w-[504px]">
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

              {/* Thành phần form nhập liệu và validation */}
              <RegisterForm
                formData={formData}
                errors={errors}
                serverError={serverError}
                isSubmitting={isSendingOtp}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            </div>

            {/* Chân trang thông tin bản quyền và liên kết */}
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
        )}
      </div>
    </div>
  );
}

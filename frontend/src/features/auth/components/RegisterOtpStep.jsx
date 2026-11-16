import { Loader2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { maskPhoneNumber } from '../utils/phoneUtils';

const OTP_LENGTH = 6;
const COUNTDOWN_INITIAL_SECONDS = 120; // 02:00 theo thiết kế Figma

/**
 * Màn hình nhập mã OTP SMS chuẩn thiết kế Figma qua 6 trạng thái:
 * 1. INIT (1757:1506): 6 ô trống, timer 02:00, resend disabled, nút disabled.
 * 2. TYPING (1757:1998): Đang nhập ký tự, đủ 6 số nút active.
 * 3. WRONG_CODE (1757:2080): Báo lỗi đỏ "Mã OTP không chính xác. Vui lòng thử lại."
 * 4. EXPIRED (1757:2162): Timer 00:00 đỏ, lỗi "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.", resend active.
 * 5. VERIFYING (1757:2244): Nút loading "Đang xác thực...", khóa input/resend.
 * 6. SUCCESS (1757:2326): Xác thực thành công, nút "Đến trang đăng nhập" (/dang-nhap).
 */
export default function RegisterOtpStep({
  phoneNumber,
  onVerify,
  onResend,
  onBackToForm,
  isVerifying = false,
  isSuccess = false,
  error = null,
  initialDigits = null,
  initialCountdown = COUNTDOWN_INITIAL_SECONDS,
}) {
  const [digits, setDigits] = useState(initialDigits || Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(
    initialCountdown !== undefined ? initialCountdown : COUNTDOWN_INITIAL_SECONDS
  );
  const [isResending, setIsResending] = useState(false);
  const [internalError, setInternalError] = useState(null);

  const inputRefs = useRef([]);
  const baseId = useId();

  // Đếm ngược 120s (02:00)
  useEffect(() => {
    if (isSuccess || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, countdown]);

  // Cập nhật lỗi từ props nếu có
  useEffect(() => {
    if (error) {
      setInternalError(error);
    }
  }, [error]);

  const isExpired = countdown === 0;
  const isCodeComplete = digits.every((d) => d !== '');

  // Khi hết hạn: dọn sạch các ô nhập theo chuẩn Figma node 1757:2162
  useEffect(() => {
    if (isExpired && !isSuccess) {
      setDigits(Array(OTP_LENGTH).fill(''));
    }
  }, [isExpired, isSuccess]);

  // Định dạng thời gian mm:ss
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Xác định thông báo trạng thái theo chuẩn Figma
  const getStatusMessage = () => {
    if (isSuccess) {
      return { text: 'Xác thực số điện thoại thành công!', color: 'text-[#f5f2ed]' };
    }
    if (isExpired) {
      return { text: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.', color: 'text-[#e04445]' };
    }
    if (internalError) {
      if (
        internalError.includes('không chính xác') ||
        internalError.includes('invalid-verification-code') ||
        internalError.includes('sai')
      ) {
        return { text: 'Mã OTP không chính xác. Vui lòng thử lại.', color: 'text-[#e04445]' };
      }
      return { text: internalError, color: 'text-[#e04445]' };
    }
    return null;
  };

  const statusMessage = getStatusMessage();
  // Chỉ báo viền đỏ cả 6 ô khi có lỗi mã không chính xác (WRONG_CODE); EXPIRED giữ viền trung tính
  const isWrongCodeState = Boolean(internalError && !isSuccess && !isExpired);

  // Xử lý thay đổi từng ô nhập
  const handleDigitChange = (index, value) => {
    if (isVerifying || isSuccess || isExpired) return;

    if (internalError) {
      setInternalError(null);
    }

    const numbers = value.replace(/[^0-9]/g, '');
    if (!numbers) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    const lastChar = numbers.slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = lastChar;
      return next;
    });

    // Tự động chuyển sang ô tiếp theo
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý phím Backspace và mũi tên điều hướng
  const handleKeyDown = (index, e) => {
    if (isVerifying || isSuccess || isExpired) return;

    if (e.key === 'Backspace') {
      if (digits[index] !== '') {
        setDigits((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
      } else if (index > 0) {
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
        inputRefs.current[index - 1]?.focus();
      }
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter' && isCodeComplete && !isExpired && !isVerifying) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Hỗ trợ paste cả chuỗi OTP 6 số
  const handlePaste = (e) => {
    if (isVerifying || isSuccess || isExpired) return;
    e.preventDefault();

    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedData) return;

    setDigits((prev) => {
      const nextDigits = [...prev];
      for (let i = 0; i < pastedData.length; i++) {
        nextDigits[i] = pastedData[i];
      }
      return nextDigits;
    });
    setInternalError(null);

    const nextFocusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  // Xác nhận OTP
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!isCodeComplete || isExpired || isVerifying || isSuccess) return;

    const code = digits.join('');
    onVerify(code);
  };

  // Gửi lại mã OTP
  const handleResend = async () => {
    if (countdown > 0 || isResending || isVerifying || isSuccess) return;

    setIsResending(true);
    setInternalError(null);

    try {
      await onResend();
      setDigits(Array(OTP_LENGTH).fill(''));
      setCountdown(COUNTDOWN_INITIAL_SECONDS);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setInternalError(err?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen lg:h-[1280px] w-full flex-col justify-between pt-6 pb-6 px-3 sm:px-8 lg:px-14 lg:pt-[48px] lg:pb-[32px]">
      {/* 1. Thanh điều hướng trên cùng (1757:1531) - height: 16px */}
      <div className="mx-auto w-full max-w-[504px] lg:max-w-[536px] h-[16px] flex items-center justify-between text-xs text-[#8f929a] mb-5 lg:mb-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 transition hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Về trang chủ</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 text-[#8f929a] transition hover:text-white cursor-pointer select-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span>Tiếng Việt</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* 2. Khối nội dung xác thực OTP qua SMS (1757:1542 / 1757:2362) - width: 504px, height: 510px, 8 children với gap: 24px */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-[504px] flex flex-col gap-[24px]"
      >
        {/* Con 1: Giới thiệu xác thực (1757:1543) - height: 83px, gap: 8px */}
        <div className="h-[83px] flex flex-col justify-between">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e04445] leading-[13px] h-[13px]">
            XÁC THỰC ĐIỆN THOẠI
          </span>
          <h2 className="font-sans text-[30px] font-semibold tracking-tight text-[#f5f2ed] leading-[38px] h-[38px]">
            Xác thực số điện thoại
          </h2>
          <p className="text-[13px] text-[#9d9ea5] leading-[16px] h-[16px]">
            {isSuccess
              ? 'Số điện thoại của bạn đã được xác thực.'
              : 'Chúng tôi đã gửi mã xác thực gồm 6 chữ số qua SMS đến số điện thoại của bạn.'}
          </p>
        </div>

        {/* Con 2: Số điện thoại đã che (1757:1547) - height: 28px */}
        <div className="h-[28px] flex items-center justify-center text-center">
          <p className="font-sans text-[22px] font-semibold tracking-wider text-[#f5f2ed] leading-[28px]">
            {maskPhoneNumber(phoneNumber)}
          </p>
        </div>

        {/* Con 3: Hướng dẫn nhập mã (1757:1549 / 1757:2369) - height: 16px */}
        <div className="h-[16px] flex items-center justify-center text-center">
          <p className="text-[13px] text-[#9d9ea5] leading-[16px]">
            {isSuccess
              ? 'Bạn có thể tiếp tục đến trang đăng nhập.'
              : 'Vui lòng nhập mã OTP để hoàn tất đăng ký tài khoản.'}
          </p>
        </div>

        {/* Con 4: Mã OTP · 6 ô (1757:1550) - height: 64px, gap: 12px */}
        <div
          className="h-[52px] sm:h-[64px] flex items-center justify-between gap-1.5 sm:gap-[12px]"
          onPaste={handlePaste}
        >
          {digits.map((digit, index) => {
            const inputId = `${baseId}-digit-${index}`;
            return (
              <input
                key={index}
                id={inputId}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete="one-time-code"
                value={digit}
                disabled={isVerifying || isSuccess || isExpired}
                aria-label={`Chữ số xác thực OTP thứ ${index + 1}`}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`h-full min-w-0 w-full flex-1 max-w-[74px] rounded-[8px] bg-[#17181b] border text-center text-[20px] sm:text-[22px] font-semibold text-[#f5f2ed] outline-none transition select-none disabled:cursor-not-allowed ${
                  isWrongCodeState
                    ? 'border-[#e04445] focus:border-[#e04445]'
                    : 'border-[#26282e] focus:border-[#e04445]'
                }`}
              />
            );
          })}
        </div>

        {/* Con 5: Thời gian và gửi lại (1757:1563) - height: 50px, gap: 18px */}
        <div className="h-[50px] flex flex-col items-center justify-between text-[13px]">
          <p className="h-[16px] leading-[16px] text-[#9d9ea5] text-center">
            <span>Mã xác thực có hiệu lực trong&nbsp;</span>
            <strong
              className={
                isExpired ? 'text-[#e04445] font-semibold' : 'text-[#f5f2ed] font-semibold'
              }
            >
              {formatTimer(countdown)}
            </strong>
          </p>

          <p className="h-[16px] leading-[16px] text-[#9d9ea5] text-center">
            <span>Bạn chưa nhận được mã?&nbsp;</span>
            {isExpired ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || isVerifying}
                className="text-[#e04445] hover:underline font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Đang gửi lại...' : 'Gửi lại mã'}
              </button>
            ) : (
              <span className="text-[#74767e] font-semibold select-none cursor-not-allowed">
                Gửi lại mã
              </span>
            )}
          </p>
        </div>

        {/* Con 6: Thông báo trạng thái (1757:1570) - height: 34px cố định để giữ layout ổn định */}
        <div
          role="status"
          className="h-[34px] flex items-center justify-center text-center px-2"
        >
          {statusMessage && (
            <p className={`text-[12px] font-normal leading-tight ${statusMessage.color}`}>
              {statusMessage.text}
            </p>
          )}
        </div>

        {/* Con 7: Nút hành động chính (1757:1572 / 1757:2392) - height: 52px */}
        <div className="h-[52px] w-full">
          {isSuccess ? (
            <Link
              to="/dang-nhap"
              className="flex h-[52px] w-full items-center justify-center rounded-[8px] bg-[#ca3538] px-6 text-[14px] font-semibold text-white shadow-none transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
            >
              <span>Đến trang đăng nhập</span>
            </Link>
          ) : isVerifying ? (
            <button
              type="button"
              disabled
              className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[8px] bg-[#ca3538] px-6 text-[14px] font-semibold text-white opacity-90 cursor-wait"
            >
              <Loader2 size={18} className="animate-spin text-white" />
              <span>Đang xác thực...</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isCodeComplete || isExpired}
              className={`flex h-[52px] w-full items-center justify-center rounded-[8px] px-6 text-[14px] font-semibold shadow-none transition ${
                isCodeComplete && !isExpired
                  ? 'bg-[#ca3538] text-white hover:brightness-110 active:scale-[0.99] cursor-pointer'
                  : 'bg-[#742629] text-[#9d9ea5] cursor-not-allowed opacity-90'
              }`}
            >
              <span>Xác nhận OTP</span>
            </button>
          )}
        </div>

        {/* Con 8: Điều hướng quay lại (1757:1575 / 1757:2395) - height: 15px */}
        <div className="h-[15px] flex items-center justify-center text-center">
          {!isSuccess && (
            <button
              type="button"
              onClick={onBackToForm}
              disabled={isVerifying}
              className="inline-block text-[12px] font-semibold text-[#e04445] hover:underline transition cursor-pointer leading-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Quay lại đăng ký
            </button>
          )}
        </div>
      </form>

      {/* 3. Chân trang bản quyền và điều khoản (1757:1577) - width: 536px, height: 41px, gap: 14px */}
      <div className="mx-auto w-full max-w-[504px] lg:max-w-[536px] h-[41px] flex flex-col justify-between text-center text-xs text-[#6b7280]">
        <div className="h-[14px] flex items-center justify-center gap-3 text-[11.5px] text-[#8f929a] leading-[14px]">
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
        <p className="h-[13px] text-[11px] text-[#525560] leading-[13px]">
          © 2026 Galaxy Cinema. Mọi quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}

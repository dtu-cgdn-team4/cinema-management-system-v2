import { AlertCircle, CheckCircle, RefreshCw, Smartphone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatDisplayPhone } from '../utils/phoneUtils';

/**
 * Modal nhập mã xác thực OTP từ Firebase Phone Authentication.
 */
export default function OtpVerificationModal({
  phoneNumber,
  isOpen,
  isVerifying,
  error,
  onClose,
  onVerify,
  onResend,
}) {
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRef = useRef(null);

// Mỗi lần mở modal bắt đầu khoảng chờ 60 giây trước khi cho phép gửi lại OTP.
  useEffect(() => {
    if (!isOpen) {
      setOtpCode('');
      setCountdown(60);
      return;
    }

    // Đưa con trỏ vào ô mã để người dùng có thể nhập ngay khi modal xuất hiện.
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(focusTimer);
      clearInterval(timer);
    };
  }, [isOpen]);

  // Không cho đóng modal bằng ESC trong lúc đang gửi mã xác minh.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isVerifying) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isVerifying, onClose]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const clean = otpCode.trim();
    if (clean.length === 6 && !isVerifying) {
      onVerify(clean);
    }
  };

  const handleResendClick = async () => {
    if (countdown > 0 || isResending || isVerifying) return;
    setIsResending(true);
    try {
      await onResend();
      setCountdown(60);
      setOtpCode('');
    } finally {
      setIsResending(false);
    }
  };

  const isEmulatorActive = Boolean(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Nhấp ra ngoài modal cũng đóng bước xác minh nếu không có yêu cầu đang chạy. */}
      <div
        onClick={isVerifying ? undefined : onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Nội dung nhập mã và các thao tác xác minh/gửi lại. */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          disabled={isVerifying}
          aria-label="Đóng cửa sổ xác thực OTP"
          className="absolute right-4 top-4 text-muted transition hover:text-white disabled:opacity-40"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl border border-brand/20 bg-brand/10 text-brand mb-4">
            <Smartphone size={24} />
          </div>

          <h3 id="otp-modal-title" className="font-display text-xl font-bold text-white">
            Xác thực số điện thoại
          </h3>
          <p className="mt-1.5 text-xs text-muted max-w-xs leading-relaxed">
            Mã OTP gồm 6 số đã được gửi qua tin nhắn SMS tới số điện thoại:
          </p>
          <p className="mt-1 font-mono text-base font-bold text-white">
            {formatDisplayPhone(phoneNumber)}
          </p>
        </div>

        {isEmulatorActive && (
          <div className="mt-3.5 rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-left text-[11px] text-info">
            💡 <strong>Môi trường Firebase Emulator:</strong> Bạn có thể dùng mã thử nghiệm mặc định hoặc tra cứu mã tạo ra tại Firebase Emulator UI/Console.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand/40 bg-brand/10 p-3 text-left text-xs text-red-200"
          >
            <AlertCircle size={16} className="shrink-0 text-brand mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="mt-6 flex flex-col gap-5">
          <div>
            <label htmlFor="otp-input" className="block text-center text-xs font-semibold text-white/90 mb-2">
              Nhập mã OTP 6 chữ số
            </label>
            <input
              id="otp-input"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isVerifying}
              placeholder="······"
              className="h-14 w-full rounded-xl border border-line bg-card text-center font-mono text-2xl font-bold tracking-[0.4em] text-white transition placeholder:text-muted/30 focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleResendClick}
              disabled={countdown > 0 || isResending || isVerifying}
              className="flex items-center gap-1.5 font-semibold text-brand transition hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
            >
              <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} />
              {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã OTP'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="text-muted transition hover:text-white disabled:opacity-40"
            >
              Đổi số điện thoại
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={otpCode.trim().length !== 6 || isVerifying}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark px-4 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerifying ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang xác minh OTP & tạo tài khoản...
                </span>
              ) : (
                <>
                  <CheckCircle size={17} />
                  Xác nhận & Hoàn tất đăng ký
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="h-10 w-full rounded-xl border border-line bg-transparent text-xs font-semibold text-muted transition hover:bg-card hover:text-white disabled:opacity-40"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

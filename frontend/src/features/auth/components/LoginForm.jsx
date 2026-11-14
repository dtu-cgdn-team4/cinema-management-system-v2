import { Link } from 'react-router-dom';
import imgMail from '@/assets/auth/mail.svg';
import imgLockKeyhole from '@/assets/auth/lock-keyhole.svg';
import imgEyeOff from '@/assets/auth/eye-off.svg';
import imgCheck from '@/assets/auth/check.svg';
import imgArrowRight from '@/assets/auth/arrow-right.svg';
import { Eye } from 'lucide-react';

/**
 * Biểu mẫu đăng nhập người dùng tối ưu hóa kích thước vừa khít viewport không gây scrollbar
 */
export const LoginForm = ({
  formData,
  showPassword,
  setShowPassword,
  errors,
  isSubmitting,
  isGoogleLoading,
  handleChange,
  handleSubmit,
  handleGoogleLogin,
}) => {
  return (
    <div
      className="flex flex-col gap-4 lg:gap-5 w-full max-w-[408px] mx-auto select-none"
      data-name="Biểu mẫu đăng nhập"
    >
      {/* Khối tiêu đề chào mừng */}
      <div className="flex flex-col gap-1.5 text-left" data-name="Chào mừng">
        <span className="font-semibold text-[10px] tracking-[2.2px] text-[#e04445] uppercase">
          Thành viên Galaxy
        </span>
        <h1 className="font-semibold text-[26px] sm:text-[30px] xl:text-[34px] tracking-[-1.3px] leading-tight text-[#f5f2ed]">
          Chào mừng trở lại.
        </h1>
        <p className="font-normal text-[13px] sm:text-[14px] leading-relaxed text-[#9d9ea5]">
          Đăng nhập để tiếp tục hành trình điện ảnh của bạn.
        </p>
      </div>

      {/* Thông báo lỗi tổng (nếu có từ server) */}
      {errors.general && (
        <div
          role="alert"
          className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-red-200 text-[12px] flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#e04445] shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Form nhập liệu */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 lg:gap-4 w-full" noValidate>
        {/* Trường Email / Tên đăng nhập */}
        <div className="flex flex-col gap-1.5 w-full text-left" data-name="Trường đăng nhập">
          <label
            htmlFor="username"
            className="font-medium text-[12px] sm:text-[13px] text-[#f5f2ed]"
          >
            Email/ Tên đăng nhập
          </label>
          <div
            className={`h-[48px] lg:h-[52px] bg-[#17181b] border ${
              errors.username ? 'border-red-500 ring-1 ring-red-500' : 'border-[#303135] focus-within:border-[#ca3538]'
            } rounded-[8px] px-3.5 flex items-center gap-3 transition-colors`}
          >
            <div className="w-[18px] h-[18px] shrink-0 flex items-center justify-center">
              <img
                src={imgMail}
                alt="Mail icon"
                className="w-[18px] h-[18px] object-contain opacity-70"
              />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isSubmitting || isGoogleLoading}
              placeholder="Nhập địa chỉ email hoặc tên đăng nhập của bạn"
              className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-[#f5f2ed] placeholder-[#74767e] disabled:opacity-50"
            />
          </div>
          {errors.username && (
            <span className="text-red-400 text-[11px] pl-1 font-normal">
              {errors.username}
            </span>
          )}
        </div>

        {/* Trường Mật khẩu */}
        <div className="flex flex-col gap-1.5 w-full text-left" data-name="Trường đăng nhập">
          <label
            htmlFor="password"
            className="font-medium text-[12px] sm:text-[13px] text-[#f5f2ed]"
          >
            Mật khẩu
          </label>
          <div
            className={`h-[48px] lg:h-[52px] bg-[#17181b] border ${
              errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-[#303135] focus-within:border-[#ca3538]'
            } rounded-[8px] px-3.5 flex items-center gap-3 transition-colors`}
          >
            <div className="w-[18px] h-[18px] shrink-0 flex items-center justify-center">
              <img
                src={imgLockKeyhole}
                alt="Lock icon"
                className="w-[18px] h-[18px] object-contain opacity-70"
              />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting || isGoogleLoading}
              placeholder="Nhập mật khẩu"
              className="flex-1 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-[#f5f2ed] placeholder-[#74767e] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="w-[18px] h-[18px] shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            >
              {showPassword ? (
                <Eye className="w-[18px] h-[18px] text-[#74767e]" />
              ) : (
                <img
                  src={imgEyeOff}
                  alt="Toggle show password"
                  className="w-[18px] h-[18px] object-contain"
                />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-400 text-[11px] pl-1 font-normal">
              {errors.password}
            </span>
          )}
        </div>

        {/* Tùy chọn Ghi nhớ đăng nhập & Quên mật khẩu */}
        <div
          className="flex items-center justify-between w-full"
          data-name="Tùy chọn đăng nhập"
        >
          <label className="flex items-center gap-[9px] cursor-pointer group">
            <div
              className={`w-[17px] h-[17px] rounded-[4px] border flex items-center justify-center transition-all ${
                formData.rememberMe
                  ? 'bg-[#ca3538] border-[#ca3538]'
                  : 'bg-[#17181b] border-[#303135] group-hover:border-[#74767e]'
              }`}
            >
              {formData.rememberMe && (
                <img
                  src={imgCheck}
                  alt="Checked"
                  className="w-[12px] h-[12px] object-contain"
                />
              )}
            </div>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="sr-only"
            />
            <span className="font-normal text-[12px] text-[#9d9ea5] group-hover:text-[#f5f2ed] transition-colors">
              Ghi nhớ đăng nhập
            </span>
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-[12px] text-[#e04445] hover:text-[#ca3538] hover:underline transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Nút Đăng nhập chính */}
        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="h-[48px] lg:h-[50px] w-full bg-[#ca3538] hover:bg-[#b02e31] active:bg-[#992528] disabled:opacity-50 disabled:cursor-not-allowed rounded-[8px] flex items-center justify-center gap-3 text-white font-semibold text-[14px] transition-all cursor-pointer shadow-lg shadow-[#ca3538]/25"
          data-name="Đăng nhập"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Đang xử lý...</span>
            </span>
          ) : (
            <>
              <span>Đăng nhập</span>
              <img
                src={imgArrowRight}
                alt="Arrow right"
                className="w-[18px] h-[18px] object-contain"
              />
            </>
          )}
        </button>
      </form>

      {/* Đăng nhập thay thế */}
      <div className="flex flex-col gap-3 lg:gap-3.5 w-full" data-name="Đăng nhập thay thế">
        {/* Phân cách */}
        <div className="flex items-center gap-4 w-full" data-name="Phân cách">
          <div className="h-px bg-[#303135] flex-1" />
          <span className="font-normal text-[11px] text-[#74767e] whitespace-nowrap">
            hoặc tiếp tục với
          </span>
          <div className="h-px bg-[#303135] flex-1" />
        </div>

        {/* Nút đăng nhập Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting || isGoogleLoading}
          className="h-[46px] lg:h-[48px] w-full border border-[#303135] hover:border-[#4d4e55] hover:bg-[#17181b]/80 rounded-[8px] flex items-center justify-center gap-3 text-[#f5f2ed] transition-colors cursor-pointer group disabled:opacity-50"
          data-name="Đăng nhập Google"
        >
          {isGoogleLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-[#4285F4]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="font-medium text-[13px] text-[#9d9ea5]">Đang kết nối Google...</span>
            </span>
          ) : (
            <>
              {/* Google Icon chuẩn */}
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="font-medium text-[13px] text-[#f5f2ed] group-hover:text-white">
                Tiếp tục với Google
              </span>
            </>
          )}
        </button>
      </div>

      {/* Lối sang Đăng ký */}
      <div
        className="flex items-center justify-center gap-1.5 text-[12px] sm:text-[13px]"
        data-name="Lối sang đăng ký"
      >
        <span className="font-normal text-[#9d9ea5]">Chưa có tài khoản?</span>
        <Link
          to="/dang-ky"
          className="font-semibold text-[#e04445] hover:text-[#ca3538] hover:underline transition-colors"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;

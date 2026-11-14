import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/** Hiển thị ngày sinh thống nhất khi dữ liệu đến từ native picker hoặc người dùng nhập. */
function formatDateToDisplay(val) {
  if (!val) return '';
  const str = String(val).trim();
  if (str.includes('/')) return str;
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day} / ${month} / ${year}`;
    }
  }
  return str;
}

/** Nhận dữ liệu và lỗi từ trang đăng ký; các thay đổi được báo ngược qua onChange. */
export default function RegisterForm({
  formData,
  errors = {},
  serverError,
  isSubmitting,
  onChange,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const datePickerRef = useRef(null);

  const getInputClass = (fieldName, extraPadding = '') => {
    const hasError = Boolean(errors[fieldName]);
    return `h-[48px] w-full rounded-[8px] border bg-[#17181b] text-[13px] text-white placeholder-[#74767e] transition outline-none ${extraPadding} ${
      hasError
        ? 'border-[1.5px] border-[#f87171] focus:border-[#f87171] focus:ring-0'
        : 'border-[#303135] hover:border-white/20 focus:border-[#ca3538] focus:ring-1 focus:ring-[#ca3538]'
    }`;
  };

  // Chuẩn hóa chuỗi ngày sinh theo từng nhóm chữ số để người dùng dễ nhập đúng thứ tự ngày/tháng/năm.
  const handleDateInputChange = (e) => {
    let raw = e.target.value.replace(/[^0-9/]/g, '');
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 2) {
      raw = digits;
    } else if (digits.length <= 4) {
      raw = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    } else {
      raw = `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4, 8)}`;
    }
    onChange('dateOfBirth', raw);
  };

  // Native picker trả về ISO; chuyển sang định dạng mà ô nhập đang hiển thị.
  const handleNativePickerChange = (e) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (isoVal) {
      onChange('dateOfBirth', formatDateToDisplay(isoVal));
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      {/* Thông báo lỗi tổng quát từ server nếu có và không phải lỗi từng trường */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[8px] border border-brand/40 bg-brand/10 p-2.5 text-xs text-red-200"
        >
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-brand" />
          <div className="flex-1">
            <p className="font-semibold text-white">Đăng ký không thành công</p>
            <p className="mt-0.5 text-red-300">{serverError}</p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="username" className="block font-inter font-medium text-[13px] text-[#f5f2ed] mb-2">
          Tên đăng nhập
        </label>
        <div className="relative">
          <User
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e]"
          />
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Nhập tên đăng nhập để đăng ký"
            value={formData.username}
            onChange={(e) => onChange('username', e.target.value)}
            className={getInputClass('username', 'pl-10 pr-3.5')}
          />
        </div>
        {errors.username && (
          <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
            <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
            <span>{errors.username}</span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="fullName" className="block font-sans font-medium text-[12px] text-[#d1d5db] mb-2">
          Họ và tên
        </label>
        <div className="relative">
          <User
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e]"
          />
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Nhập họ và tên người dùng"
            value={formData.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            className={getInputClass('fullName', 'pl-10 pr-3.5')}
          />
        </div>
        {errors.fullName && (
          <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
            <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
            <span>{errors.fullName}</span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block font-sans font-medium text-[12px] text-[#d1d5db] mb-2">
          Email
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e]"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Nhập địa chỉ email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={getInputClass('email', 'pl-10 pr-3.5')}
          />
        </div>
        {errors.email && (
          <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
            <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
            <span>{errors.email}</span>
          </p>
        )}
      </div>

      {/* Ngày sinh và giới tính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Ngày sinh có ô nhập văn bản và native picker hỗ trợ chọn nhanh. */}
        <div>
          <label htmlFor="dateOfBirth" className="block font-sans font-medium text-[12px] text-[#d1d5db] mb-2">
            Ngày sinh
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => datePickerRef.current?.showPicker?.()}
              aria-label="Chọn ngày trên lịch"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e] hover:text-white transition cursor-pointer z-10"
            >
              <Calendar size={16} />
            </button>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="text"
              placeholder="DD / MM / YYYY"
              value={formatDateToDisplay(formData.dateOfBirth)}
              onChange={handleDateInputChange}
              className={getInputClass('dateOfBirth', 'pl-10 pr-3.5')}
            />
            {/* Picker được giữ ẩn; nút lịch phía trên gọi API showPicker của trình duyệt. */}
            <input
              ref={datePickerRef}
              type="date"
              tabIndex={-1}
              aria-hidden="true"
              onChange={handleNativePickerChange}
              className="sr-only"
            />
          </div>
          {errors.dateOfBirth && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
              <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
              <span>{errors.dateOfBirth}</span>
            </p>
          )}
        </div>

        {/* Giá trị gửi lên API dùng mã giới tính, còn nhãn được hiển thị bằng tiếng Việt. */}
        <div>
          <span className="block font-sans font-medium text-[12px] text-[#d1d5db] mb-2">
            Giới tính
          </span>
          <div
            className={`flex h-[48px] items-center rounded-[8px] border bg-[#17181b] transition ${
              errors.gender
                ? 'border-[1.5px] border-[#f87171]'
                : 'border-[#303135] hover:border-white/20'
            }`}
          >
            {[
              { label: 'Nam', value: 'MALE' },
              { label: 'Nữ', value: 'FEMALE' },
              { label: 'Khác', value: 'OTHER' },
            ].map((option, index) => {
              const isSelected = formData.gender === option.value;
              return (
                <div key={option.value} className="flex-1 h-full flex items-center">
                  {index > 0 && <div className="w-[1px] h-6 bg-[#303135] shrink-0" />}
                  <label
                    className="flex-1 h-full flex items-center justify-center gap-2 cursor-pointer select-none text-[13px] text-[#8f929a] hover:text-white"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => onChange('gender', e.target.value)}
                      className="sr-only"
                    />
                    <span
                      className={`size-3.5 rounded-full border transition flex items-center justify-center ${
                        isSelected
                          ? 'border-[#ca3538] bg-transparent'
                          : 'border-[#6b7280] bg-transparent'
                      }`}
                    >
                      {isSelected && <span className="size-1.5 rounded-full bg-[#ca3538]" />}
                    </span>
                    <span>{option.label}</span>
                  </label>
                </div>
              );
            })}
          </div>
          {errors.gender && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
              <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
              <span>{errors.gender}</span>
            </p>
          )}
        </div>
      </div>

      {/* CMND/CCCD và số điện thoại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CMND/CCCD là thông tin tùy chọn. */}
        <div>
          <label htmlFor="idCard" className="block font-sans font-medium text-[12px] text-[#d1d5db] mb-2">
            CMND
          </label>
          <div className="relative">
            <CreditCard
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e]"
            />
            <input
              id="idCard"
              name="idCard"
              type="text"
              placeholder="Nhập số CMND"
              value={formData.idCard}
              onChange={(e) => onChange('idCard', e.target.value)}
              className={getInputClass('idCard', 'pl-10 pr-3.5')}
            />
          </div>
          {errors.idCard && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
              <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
              <span>{errors.idCard}</span>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block font-sans font-medium text-[12px] text-[#d1d5db] mb-2">
            Số điện thoại
          </label>
          <div className="relative">
            <Phone
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e]"
            />
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="Nhập số điện thoại"
              value={formData.phoneNumber}
              onChange={(e) => onChange('phoneNumber', e.target.value)}
              className={getInputClass('phoneNumber', 'pl-10 pr-3.5')}
            />
          </div>
          {errors.phoneNumber && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
              <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
              <span>{errors.phoneNumber}</span>
            </p>
          )}
        </div>
      </div>

      {/* Địa chỉ là thông tin tùy chọn. */}
      <div>
        <label htmlFor="address" className="block font-sans font-medium text-[12px] text-[#d1d5db] mb-2">
          Địa chỉ
        </label>
        <div className="relative">
          <MapPin
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e]"
          />
          <input
            id="address"
            name="address"
            type="text"
            autoComplete="street-address"
            placeholder="Nhập địa chỉ"
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            className={getInputClass('address', 'pl-10 pr-3.5')}
          />
        </div>
        {errors.address && (
          <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
            <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
            <span>{errors.address}</span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block font-sans font-medium text-[12px] text-[#d1d5db] mb-2">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e]"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Tạo mật khẩu (tối thiểu 8 ký tự)"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            className={getInputClass('password', 'pl-10 pr-10')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74767e] hover:text-white transition cursor-pointer"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        {errors.password && (
          <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
            <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
            <span>{errors.password}</span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block font-sans font-medium text-[12px] text-[#d1d5db] mb-2">
          Nhập lại mật khẩu
        </label>
        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e]"
          />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu để xác nhận"
            value={formData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            className={getInputClass('confirmPassword', 'pl-10 pr-10')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74767e] hover:text-white transition cursor-pointer"
          >
            {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
            <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
            <span>{errors.confirmPassword}</span>
          </p>
        )}
      </div>

      {/* Chỉ cho phép gửi biểu mẫu khi người dùng xác nhận đồng ý điều khoản. */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => onChange('termsAccepted', e.target.checked)}
            className={`mt-0.5 size-4 rounded bg-[#17181b] text-[#ca3538] accent-[#ca3538] focus:ring-0 cursor-pointer shrink-0 ${
              errors.termsAccepted ? 'border-[1.5px] border-[#f87171]' : 'border border-[#303135]'
            }`}
          />
          <span className="text-[12px] leading-relaxed text-[#8f929a]">
            Tôi đồng ý với{' '}
            <a
              href="#dieu-khoan"
              onClick={(e) => e.preventDefault()}
              className="text-[#ca3538] hover:underline font-medium"
            >
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a
              href="#chinh-sach"
              onClick={(e) => e.preventDefault()}
              className="text-[#ca3538] hover:underline font-medium"
            >
              Chính sách bảo mật
            </a>{' '}
            của Galaxy Cinema.
          </span>
        </label>
        {errors.termsAccepted && (
          <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#f87171]">
            <AlertCircle size={14} className="shrink-0 text-[#f87171]" />
            <span>{errors.termsAccepted}</span>
          </p>
        )}
      </div>

      {/* Gửi biểu mẫu hoặc chuyển sang trang đăng nhập. */}
      <div className="pt-2 flex flex-col gap-2.5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[8px] bg-[#ca3538] px-6 text-[14px] font-semibold text-white shadow-none transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang chuẩn bị xác thực OTP...
            </span>
          ) : (
            <>
              <span>Đăng ký</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#8f929a]">
          Đã có tài khoản?{' '}
          <Link to="/dang-nhap" className="font-medium text-[#ca3538] hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </form>
  );
}

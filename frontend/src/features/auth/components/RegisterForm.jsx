import {
  AlertCircle,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/** Hiển thị ngày sinh theo định dạng DD / MM / YYYY trong ô nhập. */
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

function parseDateInput(val) {
  if (!val) return null;
  const value = String(val).trim();
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const displayMatch = value.match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/);
  const match = isoMatch
    ? { year: Number(isoMatch[1]), month: Number(isoMatch[2]), day: Number(isoMatch[3]) }
    : displayMatch
      ? { year: Number(displayMatch[3]), month: Number(displayMatch[2]), day: Number(displayMatch[1]) }
      : null;

  if (!match) return null;
  const date = new Date(match.year, match.month - 1, match.day);
  return date.getFullYear() === match.year && date.getMonth() === match.month - 1 && date.getDate() === match.day
    ? date
    : null;
}

/** Nhận dữ liệu và lỗi từ trang đăng ký; các thay đổi được báo ngược qua onChange. */
export default function RegisterForm({
  formData,
  errors = {},
  serverError,
  isSubmitting,
  onChange,
  onSubmit,
  isCompleteProfile = false,
  submitLabel = 'Đăng ký',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarView, setCalendarView] = useState('days');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const calendarRef = useRef(null);

  useEffect(() => {
    if (!isCalendarOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!calendarRef.current?.contains(event.target)) setIsCalendarOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsCalendarOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCalendarOpen]);

  const openCalendar = () => {
    const selectedDate = parseDateInput(formData.dateOfBirth);
    const referenceDate = selectedDate || new Date();
    setCalendarMonth(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1));
    setCalendarView('days');
    setIsCalendarOpen((open) => !open);
  };

  const monthLabel = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(calendarMonth);
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const selectedDate = parseDateInput(formData.dateOfBirth);
  const currentYear = new Date().getFullYear();
  const calendarYears = Array.from({ length: 122 }, (_, index) => currentYear - index);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const getInputClass = (fieldName, extraPadding = '') => {
    const hasError = Boolean(errors[fieldName]);
    return `${isCompleteProfile ? 'h-10' : 'h-[48px]'} w-full rounded-[8px] border bg-[#17181b] text-[13px] text-white placeholder-[#74767e] transition outline-none ${extraPadding} ${
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

  return (
    <form onSubmit={onSubmit} noValidate className={`flex flex-col ${isCompleteProfile ? 'gap-2' : 'gap-3'}`}>
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
        <label htmlFor="username" className={`block font-inter font-medium text-[13px] text-[#f5f2ed] ${isCompleteProfile ? 'mb-1' : 'mb-2'}`}>
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
        <label htmlFor="fullName" className={`block font-sans font-medium text-[12px] text-[#d1d5db] ${isCompleteProfile ? 'mb-1' : 'mb-2'}`}>
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
        <label htmlFor="email" className={`block font-sans font-medium text-[12px] text-[#d1d5db] ${isCompleteProfile ? 'mb-1' : 'mb-2'}`}>
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
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCompleteProfile ? 'gap-2' : 'gap-3'}`}>
        {/* Ngày sinh có thể nhập trực tiếp hoặc chọn trên lịch tùy chỉnh. */}
        <div>
          <label htmlFor="dateOfBirth" className={`block font-sans font-medium text-[12px] text-[#d1d5db] ${isCompleteProfile ? 'mb-1' : 'mb-2'}`}>
            Ngày sinh
          </label>
          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              onClick={openCalendar}
              aria-label="Mở lịch chọn ngày sinh"
              aria-haspopup="dialog"
              aria-expanded={isCalendarOpen}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74767e] hover:text-white transition cursor-pointer z-10"
            >
              <Calendar size={16} />
            </button>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="text"
              inputMode="numeric"
              autoComplete="bday"
              placeholder="DD / MM / YYYY"
              value={formatDateToDisplay(formData.dateOfBirth)}
              onChange={handleDateInputChange}
              className={getInputClass('dateOfBirth', 'pl-10 pr-3.5')}
            />
            {isCalendarOpen && (
              <div
                role="dialog"
                aria-label="Chọn ngày sinh"
                className="absolute bottom-full left-0 z-50 mb-2 w-[min(19rem,calc(100vw-3rem))] rounded-xl border border-[#303135] bg-[#101114] p-3.5 text-[#f5f2ed] shadow-[0_18px_50px_rgba(0,0,0,0.65)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8f929a]">
                      {calendarView === 'days' ? 'Ngày sinh' : calendarView === 'years' ? 'Chọn năm' : 'Chọn tháng'}
                    </p>
                    <button
                      type="button"
                      aria-label={calendarView === 'years' ? 'Quay lại lịch' : 'Chọn tháng và năm'}
                      onClick={() => setCalendarView((view) => (view === 'years' ? 'days' : 'years'))}
                      className="mt-0.5 inline-flex items-center gap-1 rounded-md text-sm font-semibold capitalize text-white transition hover:text-[#ff7779]"
                    >
                      {monthLabel}
                      <ChevronRight size={14} className="rotate-90 text-[#8f929a]" />
                    </button>
                  </div>
                  {calendarView === 'days' && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Tháng trước"
                        onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                        className="grid size-8 place-items-center rounded-lg text-[#a6a7ad] transition hover:bg-[#25262b] hover:text-white"
                      >
                        <ChevronLeft size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label="Tháng sau"
                        onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                        className="grid size-8 place-items-center rounded-lg text-[#a6a7ad] transition hover:bg-[#25262b] hover:text-white"
                      >
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  )}
                </div>

                {calendarView === 'years' ? (
                  <div className="grid max-h-52 grid-cols-4 gap-1 overflow-y-auto p-1 text-center no-scrollbar">
                    {calendarYears.map((year) => {
                      const isSelected = calendarMonth.getFullYear() === year;
                      return (
                        <button
                          key={year}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setCalendarMonth((month) => new Date(year, month.getMonth(), 1));
                            setCalendarView('months');
                          }}
                          className={`rounded-lg py-2 text-xs transition ${
                            isSelected
                              ? 'bg-[#ca3538] font-semibold text-white'
                              : 'text-[#c6c6cb] hover:bg-[#25262b] hover:text-white'
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                ) : calendarView === 'months' ? (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {Array.from({ length: 12 }, (_, monthIndex) => {
                      const monthName = new Intl.DateTimeFormat('vi-VN', { month: 'short' }).format(
                        new Date(calendarMonth.getFullYear(), monthIndex, 1),
                      );
                      const isSelected = calendarMonth.getMonth() === monthIndex;
                      return (
                        <button
                          key={monthIndex}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setCalendarMonth((month) => new Date(month.getFullYear(), monthIndex, 1));
                            setCalendarView('days');
                          }}
                          className={`rounded-lg py-2.5 text-xs capitalize transition ${
                            isSelected
                              ? 'bg-[#ca3538] font-semibold text-white'
                              : 'text-[#c6c6cb] hover:bg-[#25262b] hover:text-white'
                          }`}
                        >
                          {monthName}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                      <span key={day} className="py-1 text-[10px] font-semibold text-[#737680]">{day}</span>
                    ))}
                    {calendarCells.map((day, index) => {
                      if (!day) return <span key={`empty-${index}`} aria-hidden="true" />;
                      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = new Date().toDateString() === date.toDateString();
                      const isFuture = date > today;

                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={isFuture}
                          aria-pressed={isSelected}
                          aria-label={new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(date)}
                          onClick={() => {
                            const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            onChange('dateOfBirth', formatDateToDisplay(isoDate));
                            setIsCalendarOpen(false);
                          }}
                          className={`grid aspect-square place-items-center rounded-lg text-xs transition disabled:cursor-not-allowed disabled:text-[#45464c] ${
                            isSelected
                              ? 'bg-[#ca3538] font-semibold text-white shadow-[0_4px_12px_rgba(202,53,56,0.3)]'
                              : isToday
                                ? 'border border-[#ca3538]/70 text-white hover:bg-[#25262b]'
                                : 'text-[#c6c6cb] hover:bg-[#25262b] hover:text-white'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
          <span className={`block font-sans font-medium text-[12px] text-[#d1d5db] ${isCompleteProfile ? 'mb-1' : 'mb-2'}`}>
            Giới tính
          </span>
          <div
            className={`flex ${isCompleteProfile ? 'h-10' : 'h-[48px]'} items-center rounded-[8px] border bg-[#17181b] transition ${
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
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCompleteProfile ? 'gap-2' : 'gap-3'}`}>
        {/* CMND/CCCD là thông tin tùy chọn. */}
        <div>
          <label htmlFor="idCard" className={`block font-sans font-medium text-[12px] text-[#d1d5db] ${isCompleteProfile ? 'mb-1' : 'mb-2'}`}>
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
          <label htmlFor="phoneNumber" className={`block font-sans font-medium text-[12px] text-[#d1d5db] ${isCompleteProfile ? 'mb-1' : 'mb-2'}`}>
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
        <label htmlFor="address" className={`block font-sans font-medium text-[12px] text-[#d1d5db] ${isCompleteProfile ? 'mb-1' : 'mb-2'}`}>
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

      {/* Mật khẩu và xác nhận mật khẩu chỉ yêu cầu khi đăng ký thông thường */}
      {!isCompleteProfile && (
        <>
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
        </>
      )}

      {/* Gửi biểu mẫu hoặc chuyển sang trang đăng nhập. */}
      <div className={`flex flex-col gap-2.5 ${isCompleteProfile ? 'pt-1' : 'pt-2'}`}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex w-full items-center justify-center gap-2.5 rounded-[8px] bg-[#ca3538] px-6 text-[14px] font-semibold text-white shadow-none transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${isCompleteProfile ? 'h-11' : 'h-[52px]'}`}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {isCompleteProfile ? 'Đang lưu thông tin...' : 'Đang chuẩn bị xác thực OTP...'}
            </span>
          ) : (
            <>
              <span>{isCompleteProfile ? submitLabel : 'Đăng ký'}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {!isCompleteProfile && (
          <p className="text-center text-xs text-[#8f929a]">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="font-medium text-[#ca3538] hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}

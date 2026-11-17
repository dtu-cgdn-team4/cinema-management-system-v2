import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getAccountProfile,
  updateAccountProfile,
  changeAccountPassword,
} from '../api/accountApi';
import {
  dmyToIso,
  getAvatarInitials,
  isoToDmy,
  validatePasswordForm,
  validateProfileForm,
} from '../utils/accountValidation';
import { formatDate } from '@/utils/format';

/**
 * Trang Quản lý thông tin tài khoản và Đổi mật khẩu.
 * Thiết kế đối chiếu Figma node 1159:2 (1440x1160px).
 */
export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout, updateUser } = useAuth();
  const dateInputRef = useRef(null);

  // Trạng thái tải dữ liệu hồ sơ
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Chuỗi hiển thị ngày sinh theo chuẩn Figma dd/MM/yyyy
  const [displayDob, setDisplayDob] = useState('');

  // Form Thông tin cá nhân (gender mặc định null nếu API không trả về)
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: null,
    citizenId: '',
    address: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);
  const [profileServerErr, setProfileServerErr] = useState(null);

  // Form Đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(null);
  const [passwordServerErr, setPasswordServerErr] = useState(null);

  // Ẩn/hiện mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Tải dữ liệu hồ sơ từ API GET /api/v1/account/me
  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileLoadError(null);
    try {
      const res = await getAccountProfile();
      // Hỗ trợ cả response đã được apiClient bóc lớp và response còn bọc trong data.
      const data = res?.data ?? res;
      setProfileData(data);
      setProfileForm({
        fullName: data?.fullName || '',
        dateOfBirth: data?.dateOfBirth || '',
        gender: data?.gender || null,
        citizenId: data?.citizenId || '',
        address: data?.address || '',
      });
      setDisplayDob(isoToDmy(data?.dateOfBirth));
    } catch (err) {
      // Chỉ lấy thông báo cần hiển thị; không ghi toàn bộ lỗi/request vào log.
      const msg =
        err?.response?.data?.message ||
        (!err?.response
          ? 'Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra dịch vụ.'
          : 'Không thể tải thông tin tài khoản.');
      setProfileLoadError(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // Điều hướng nếu chưa đăng nhập
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Xử lý thay đổi ô nhập ngày sinh dạng dd/MM/yyyy
  const handleDisplayDobChange = (e) => {
    const val = e.target.value;
    setDisplayDob(val);
    const iso = dmyToIso(val);
    // Giữ lại ngày nhập sai để validation chặn lưu, tránh biến nó thành yêu cầu xóa ngày sinh.
    setProfileForm((prev) => ({ ...prev, dateOfBirth: val.trim() ? iso || val : '' }));
    if (profileErrors.dateOfBirth) {
      setProfileErrors((prev) => ({ ...prev, dateOfBirth: null }));
    }
    setProfileSuccessMsg(null);
    setProfileServerErr(null);
  };

  // Xử lý thay đổi form hồ sơ cá nhân
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: null }));
    }
    setProfileSuccessMsg(null);
    setProfileServerErr(null);
  };

  // Xử lý gửi cập nhật hồ sơ cá nhân
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileServerErr(null);

      // Chặn dữ liệu sai ngay trên giao diện; Backend vẫn tự kiểm tra lại trước khi lưu.
    const validation = validateProfileForm(profileForm);
    if (!validation.isValid) {
      setProfileErrors(validation.errors);
      return;
    }
    setProfileErrors({});
    setProfileSubmitting(true);

    try {
      // Chỉ gửi 5 trường hồ sơ được phép cập nhật; email, số điện thoại và mã tài khoản là chỉ đọc.
      const updated = await updateAccountProfile({
        fullName: profileForm.fullName,
        dateOfBirth: profileForm.dateOfBirth,
        gender: profileForm.gender,
        citizenId: profileForm.citizenId,
        address: profileForm.address,
      });

      const data = updated?.data ?? updated;
      setProfileData((prev) => ({
        ...prev,
        fullName: data?.fullName ?? profileForm.fullName,
        dateOfBirth: data?.dateOfBirth ?? profileForm.dateOfBirth,
        gender: data?.gender !== undefined ? data.gender : profileForm.gender,
        citizenId: data?.citizenId ?? profileForm.citizenId,
        address: data?.address ?? profileForm.address,
      }));

      // Cập nhật tên trong phiên đăng nhập để Header đổi theo mà không cần tải lại trang.
      if (updateUser) {
        updateUser({
          fullName: data?.fullName ?? profileForm.fullName,
        });
      }

      setProfileSuccessMsg('Cập nhật thông tin hồ sơ thành công!');
    } catch (err) {
      // An toàn: Không log đối tượng nhạy cảm
      const resData = err?.response?.data;
      if (resData?.errors && typeof resData.errors === 'object') {
        setProfileErrors(resData.errors);
      }
      const msg =
        resData?.message ||
        (!err?.response
          ? 'Không thể kết nối máy chủ để lưu thông tin.'
          : 'Cập nhật thông tin thất bại. Vui lòng thử lại.');
      setProfileServerErr(msg);
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Xử lý thay đổi form đổi mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: null }));
    }
    setPasswordSuccessMsg(null);
    setPasswordServerErr(null);
  };

  // Xử lý gửi đổi mật khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg(null);
    setPasswordServerErr(null);

      // Kiểm tra đủ điều kiện trước khi gửi; Backend vẫn là nơi xác nhận cuối cùng.
    const validation = validatePasswordForm(passwordForm);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }
    setPasswordErrors({});
    setPasswordSubmitting(true);

    try {
      // Gửi PUT /api/v1/account/me/password với 3 trường
      await changeAccountPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordSuccessMsg('Đổi mật khẩu thành công!');
      // Xóa form sau khi đổi thành công
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      // Không ghi đối tượng lỗi/request vào log vì chúng có thể chứa thông tin mật khẩu.
      const resData = err?.response?.data;

      // Đưa lỗi theo từng trường về đúng ô nhập để người dùng biết cách sửa.
      if (resData?.errorCode === 'CURRENT_PASSWORD_INVALID') {
        setPasswordErrors((prev) => ({
          ...prev,
          currentPassword: 'Mật khẩu hiện tại không chính xác.',
        }));
      } else if (resData?.errorCode === 'GOOGLE_PASSWORD_NOT_SET') {
        setPasswordServerErr(
          'Tài khoản này đăng nhập bằng Google và chưa thiết lập mật khẩu.',
        );
      } else if (resData?.errors && typeof resData.errors === 'object') {
        setPasswordErrors(resData.errors);
      } else {
        const msg =
          resData?.message ||
          (!err?.response
            ? 'Không thể kết nối máy chủ để đổi mật khẩu.'
            : 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại thông tin.');
        setPasswordServerErr(msg);
      }
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Tính chữ viết tắt avatar và ngày tham gia
  const displayName = profileData?.fullName || user?.fullName || user?.username || 'Thành viên';
  const initials = getAvatarInitials(displayName);
  const memberCode = profileData?.memberCode || (user?.id ? `TV${String(user.id).padStart(7, '0')}` : 'TV0000000');
  const accountUsername = profileData?.username || user?.username || '';
  const loyaltyPoints = profileData?.loyaltyPoints ?? user?.loyaltyPoints ?? 0;
  const joinedDateFormatted = profileData?.joinedAt
    ? formatDate(profileData.joinedAt)
    : '12/03/2025';

  return (
    <div className="min-h-[calc(100vh-88px)] bg-page text-white py-6 md:py-8 px-4 xl:px-0">
      <div className="mx-auto max-w-304 flex flex-col gap-6">
        {/* Đường dẫn Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-xs text-muted">
          <Link to="/lich-chieu" className="transition hover:text-white">
            Trang chủ
          </Link>
          <ChevronRight size={12} className="text-muted shrink-0" />
          <span className="text-muted">Tài khoản</span>
          <ChevronRight size={12} className="text-muted shrink-0" />
          <span className="text-white font-medium">Thông tin tài khoản</span>
        </nav>

        {/* Tiêu đề trang */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-[2px] bg-brand shrink-0" />
            <h1 className="font-display text-[26px] md:text-[30px] font-bold leading-9 text-white tracking-tight">
              Quản lý tài khoản
            </h1>
          </div>
          <p className="text-xs text-muted">
            Thành viên từ {joinedDateFormatted}
          </p>
        </div>

        {/* Xử lý trạng thái tải hồ sơ ban đầu */}
        {profileLoading ? (
          <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
            {/* Skeleton Thanh bên */}
            <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
              <div className="bg-surface border border-line rounded-[16px] p-6 flex flex-col items-center gap-4">
                <div className="size-[84px] rounded-full bg-white/10" />
                <div className="h-5 w-36 bg-white/10 rounded" />
                <div className="h-4 w-20 bg-white/10 rounded-full" />
                <div className="h-6 w-28 bg-white/10 rounded" />
                <div className="h-3 w-32 bg-white/10 rounded" />
                <div className="h-11 w-full bg-white/10 rounded-xl" />
              </div>
              <div className="bg-surface border border-line rounded-[16px] p-2 flex flex-col gap-1">
                <div className="h-11 w-full bg-white/10 rounded-[10px]" />
                <div className="h-11 w-full bg-white/5 rounded-[10px]" />
                <div className="h-11 w-full bg-white/5 rounded-[10px]" />
              </div>
            </div>
            {/* Skeleton Nội dung */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-surface border border-line rounded-[16px] p-6 h-72 bg-white/5" />
              <div className="bg-surface border border-line rounded-[16px] p-6 h-96 bg-white/5" />
            </div>
          </div>
        ) : profileLoadError ? (
          <div className="bg-surface border border-line rounded-[16px] p-8 text-center flex flex-col items-center gap-4 max-w-md mx-auto">
            <AlertCircle size={40} className="text-brand" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Không thể tải thông tin tài khoản</h3>
              <p className="text-xs text-muted">{profileLoadError}</p>
            </div>
            <button
              type="button"
              onClick={fetchProfile}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-dark rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              Thử lại
            </button>
          </div>
        ) : (
          /* Bố cục chính 2 cột: Thanh bên (300px) + Nội dung tài khoản */
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Thanh bên trái: Hồ sơ & Menu */}
            <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
              {/* Card 1: Hồ sơ thành viên */}
              <div className="bg-surface border border-line rounded-[16px] px-6 pt-7 pb-6 flex flex-col items-center gap-3">
                {/* Avatar tròn với gradient hoặc ảnh Google */}
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="size-[84px] rounded-full object-cover border-2 border-brand/50 shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className="size-[84px] rounded-full bg-gradient-to-r from-[#ea384d] to-[#ea580c] flex items-center justify-center font-display font-bold text-[28px] text-white shadow-[0_10px_20px_-5px_rgba(234,56,77,0.3)] shrink-0"
                  style={{ display: user?.avatarUrl ? 'none' : 'flex' }}
                >
                  {initials}
                </div>

                {/* Tên thành viên */}
                <h2 className="text-[18px] font-bold text-white text-center tracking-tight">
                  {displayName}
                </h2>

                {/* Badge hạng Thành viên */}
                <div className="bg-[rgba(251,191,36,0.15)] border border-[rgba(251,191,36,0.35)] px-2.5 py-1 rounded-full">
                  <span className="text-[10px] tracking-[0.4px] font-bold text-[#fbbf24] uppercase">
                    Thành viên
                  </span>
                </div>

                {/* Điểm tích luỹ */}
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-[20px] text-brand">
                    {Number(loyaltyPoints).toLocaleString('vi-VN')}
                  </span>
                  <span className="text-xs text-muted">
                    điểm tích luỹ
                  </span>
                </div>

                {/* Mã thành viên */}
                <p className="text-xs text-zinc-500">
                  Mã thành viên: {memberCode}
                </p>

                {/* Nút đăng xuất */}
                <button
                  type="button"
                  onClick={logout}
                  className="w-full mt-1 bg-card hover:bg-[#212330] border border-line hover:border-white/20 rounded-[12px] px-5 py-3 flex items-center justify-center gap-2 text-[13px] font-semibold text-white transition-colors cursor-pointer"
                >
                  <LogOut size={16} className="shrink-0" />
                  <span>Đăng xuất</span>
                </button>
              </div>

              {/* Card 2: Menu điều hướng tài khoản */}
              <div className="bg-surface border border-line rounded-[16px] p-2 flex flex-col gap-1">
                <button
                  type="button"
                  className="w-full bg-[rgba(234,56,77,0.12)] text-brand font-bold text-[13px] rounded-[10px] px-4 py-3.25 text-left cursor-default"
                >
                  Thông tin tài khoản
                </button>
                <button
                  type="button"
                  onClick={() => alert('Chức năng Lịch sử điểm đang được phát triển.')}
                  className="w-full text-zinc-300 hover:text-white hover:bg-white/[0.04] font-medium text-[13px] rounded-[10px] px-4 py-3.25 text-left transition-colors cursor-pointer"
                >
                  Lịch sử điểm
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/tai-khoan/ve-da-dat')}
                  className="w-full text-zinc-300 hover:text-white hover:bg-white/[0.04] font-medium text-[13px] rounded-[10px] px-4 py-3.25 text-left transition-colors cursor-pointer"
                >
                  Vé đã đặt
                </button>
              </div>
            </aside>

            {/* Nội dung bên phải: Thông tin đăng nhập & Thông tin cá nhân */}
            <main className="flex-1 w-full flex flex-col gap-6">
              {/* Khung 1: Thông tin đăng nhập (Đổi mật khẩu) */}
              <section className="bg-surface border border-line rounded-[16px] p-6 flex flex-col gap-[18px]">
                {/* Tiêu đề mục */}
                <div className="flex flex-col gap-1">
                  <h3 className="font-display font-bold text-[18px] text-white">
                    Thông tin đăng nhập
                  </h3>
                  <p className="text-xs text-muted">
                    Đổi mật khẩu định kỳ để bảo vệ tài khoản.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-[18px]">
                  {/* Hàng 1: Mã thành viên & Tài khoản (Chỉ đọc) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Mã thành viên
                      </label>
                      <div className="bg-white/[0.04] border border-line rounded-[10px] px-4 py-3.25 text-[13px] text-muted select-none cursor-not-allowed">
                        {memberCode}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Tài khoản
                      </label>
                      <div className="bg-white/[0.04] border border-line rounded-[10px] px-4 py-3.25 text-[13px] text-muted select-none cursor-not-allowed">
                        {accountUsername}
                      </div>
                    </div>
                  </div>

                  {/* Hàng 2: Mật khẩu cũ */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-300">
                      Mật khẩu cũ <span className="text-brand">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        autoComplete="current-password"
                        className={`w-full bg-card border rounded-[10px] pl-4 pr-11 py-3.25 text-[13px] text-white placeholder-zinc-500 transition-colors focus:outline-none ${
                          passwordErrors.currentPassword
                            ? 'border-brand'
                            : 'border-line focus:border-brand'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3 text-muted hover:text-white transition-colors cursor-pointer"
                        title={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-brand">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* Hàng 3: Mật khẩu mới & Xác nhận mật khẩu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Mật khẩu mới <span className="text-brand">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Tối thiểu 8 ký tự"
                          autoComplete="new-password"
                          className={`w-full bg-card border rounded-[10px] pl-4 pr-11 py-3.25 text-[13px] text-white placeholder-zinc-500 transition-colors focus:outline-none ${
                            passwordErrors.newPassword
                              ? 'border-brand'
                              : 'border-line focus:border-brand'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute right-3 text-muted hover:text-white transition-colors cursor-pointer"
                          title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-brand">{passwordErrors.newPassword}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Xác nhận mật khẩu <span className="text-brand">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Nhập lại mật khẩu mới"
                          autoComplete="new-password"
                          className={`w-full bg-card border rounded-[10px] pl-4 pr-11 py-3.25 text-[13px] text-white placeholder-zinc-500 transition-colors focus:outline-none ${
                            passwordErrors.confirmPassword
                              ? 'border-brand'
                              : 'border-line focus:border-brand'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 text-muted hover:text-white transition-colors cursor-pointer"
                          title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-brand">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Thông báo kết quả Đổi mật khẩu */}
                  {passwordSuccessMsg && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>{passwordSuccessMsg}</span>
                    </div>
                  )}
                  {passwordServerErr && (
                    <div className="flex items-center gap-2 p-3 bg-brand/10 border border-brand/30 rounded-xl text-brand text-xs">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{passwordServerErr}</span>
                    </div>
                  )}

                  {/* Nút bấm Đổi mật khẩu */}
                  <div>
                    <button
                      type="submit"
                      disabled={passwordSubmitting}
                      className="bg-card hover:bg-[#212330] border border-line hover:border-white/20 rounded-[12px] px-5 py-3 text-[13px] font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordSubmitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </form>
              </section>

              {/* Khung 2: Thông tin cá nhân (Cập nhật hồ sơ) */}
              <section className="bg-surface border border-line rounded-[16px] p-6 flex flex-col gap-[18px]">
                {/* Tiêu đề mục */}
                <div className="flex flex-col gap-1">
                  <h3 className="font-display font-bold text-[18px] text-white">
                    Thông tin cá nhân
                  </h3>
                  <p className="text-xs text-muted">
                    Các trường có dấu * là bắt buộc.
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-[18px]">
                  {/* Hàng 1: Họ tên & Ngày sinh */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Họ tên <span className="text-brand">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileForm.fullName}
                        onChange={handleProfileChange}
                        placeholder="Nhập họ và tên"
                        className={`w-full bg-card border rounded-[10px] px-4 py-3.25 text-[13px] text-white placeholder-zinc-500 transition-colors focus:outline-none ${
                          profileErrors.fullName
                            ? 'border-brand'
                            : 'border-line focus:border-brand'
                        }`}
                      />
                      {profileErrors.fullName && (
                        <p className="text-xs text-brand">{profileErrors.fullName}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Ngày sinh
                      </label>
                      <div
                        className={`relative flex items-center bg-card border rounded-[10px] px-4 py-3.25 transition-colors ${
                          profileErrors.dateOfBirth
                            ? 'border-brand'
                            : 'border-line focus-within:border-brand'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              dateInputRef.current?.showPicker();
                            } catch {
                              dateInputRef.current?.focus();
                            }
                          }}
                          className="text-muted hover:text-white mr-2.5 shrink-0 transition-colors cursor-pointer"
                          title="Chọn ngày từ lịch"
                        >
                          <Calendar size={16} />
                        </button>
                        <input
                          ref={dateInputRef}
                          type="date"
                          tabIndex={-1}
                          value={profileForm.dateOfBirth || ''}
                          onChange={(e) => {
                            const iso = e.target.value;
                            setProfileForm((prev) => ({ ...prev, dateOfBirth: iso }));
                            setDisplayDob(isoToDmy(iso));
                            if (profileErrors.dateOfBirth) {
                              setProfileErrors((prev) => ({ ...prev, dateOfBirth: null }));
                            }
                          }}
                          className="sr-only"
                          aria-hidden="true"
                        />
                        <input
                          type="text"
                          name="dateOfBirth"
                          value={displayDob}
                          onChange={handleDisplayDobChange}
                          placeholder="15/08/2002"
                          maxLength={10}
                          className="w-full bg-transparent text-[13px] text-white placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                      {profileErrors.dateOfBirth && (
                        <p className="text-xs text-brand">{profileErrors.dateOfBirth}</p>
                      )}
                    </div>
                  </div>

                  {/* Hàng 2: Giới tính & Email (Email chỉ đọc theo yêu cầu) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Giới tính
                      </label>
                      <div className="flex items-center gap-6 py-3.25">
                        {[
                          { val: 'MALE', label: 'Nam' },
                          { val: 'FEMALE', label: 'Nữ' },
                          { val: 'OTHER', label: 'Khác' },
                        ].map(({ val, label }) => {
                          const isSelected = profileForm.gender === val;
                          return (
                            <label
                              key={val}
                              className="flex items-center gap-2 cursor-pointer select-none"
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={val}
                                checked={isSelected}
                                onChange={() =>
                                  setProfileForm((prev) => ({ ...prev, gender: val }))
                                }
                                className="sr-only"
                              />
                              <div
                                className={`size-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isSelected ? 'border-brand' : 'border-zinc-600'
                                }`}
                              >
                                {isSelected && (
                                  <div className="size-2 rounded-full bg-brand" />
                                )}
                              </div>
                              <span
                                className={`text-[13px] ${
                                  isSelected ? 'text-white font-medium' : 'text-zinc-300'
                                }`}
                              >
                                {label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Email <span className="text-brand">*</span>
                      </label>
                      <div
                        className="bg-white/[0.04] border border-line rounded-[10px] px-4 py-3.25 text-[13px] text-muted select-none cursor-not-allowed"
                        title="Email được bảo vệ và không thể thay đổi trực tiếp"
                      >
                        {profileData?.email || user?.email || 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>

                  {/* Hàng 3: CMND / CCCD & Số điện thoại (SĐT chỉ đọc theo yêu cầu) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        CMND / CCCD
                      </label>
                      <input
                        type="text"
                        name="citizenId"
                        value={profileForm.citizenId}
                        onChange={handleProfileChange}
                        placeholder="048202001234"
                        maxLength={12}
                        className={`w-full bg-card border rounded-[10px] px-4 py-3.25 text-[13px] text-white placeholder-zinc-500 transition-colors focus:outline-none ${
                          profileErrors.citizenId
                            ? 'border-brand'
                            : 'border-line focus:border-brand'
                        }`}
                      />
                      {profileErrors.citizenId && (
                        <p className="text-xs text-brand">{profileErrors.citizenId}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Số điện thoại <span className="text-brand">*</span>
                      </label>
                      <div
                        className="bg-white/[0.04] border border-line rounded-[10px] px-4 py-3.25 text-[13px] text-muted select-none cursor-not-allowed"
                        title="Số điện thoại được bảo vệ bằng OTP và không thể thay đổi trực tiếp"
                      >
                        {profileData?.phoneNumber || user?.phoneNumber || 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>

                  {/* Hàng 4: Địa chỉ */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-300">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profileForm.address}
                      onChange={handleProfileChange}
                      placeholder="Nhập địa chỉ của bạn"
                      className={`w-full bg-card border rounded-[10px] px-4 py-3.25 text-[13px] text-white placeholder-zinc-500 transition-colors focus:outline-none ${
                        profileErrors.address
                          ? 'border-brand'
                          : 'border-line focus:border-brand'
                      }`}
                    />
                    {profileErrors.address && (
                      <p className="text-xs text-brand">{profileErrors.address}</p>
                    )}
                  </div>

                  {/* Thông báo kết quả Cập nhật hồ sơ */}
                  {profileSuccessMsg && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}
                  {profileServerErr && (
                    <div className="flex items-center gap-2 p-3 bg-brand/10 border border-brand/30 rounded-xl text-brand text-xs">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{profileServerErr}</span>
                    </div>
                  )}

                  {/* Nút bấm Cập nhật */}
                  <div>
                    <button
                      type="submit"
                      disabled={profileSubmitting}
                      className="bg-brand hover:bg-brand-dark rounded-[12px] px-5 py-3 text-[13px] font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(234,56,77,0.25)]"
                    >
                      {profileSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                  </div>
                </form>
              </section>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import GoogleCallbackPage from '@/features/auth/pages/GoogleCallbackPage';
import CustomerLayout from '@/layouts/CustomerLayout';
import ShowtimeSelectionPage from '@/features/booking/pages/ShowtimeSelectionPage';
import { useAuth } from '@/context/AuthContext';

/**
 * Trang thông tin tài khoản hiển thị hồ sơ cá nhân, avatar và điểm tích lũy
 */
const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#0d0e10] text-[#f5f2ed] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#17181b] border border-[#303135] rounded-xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName || user.username}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full object-cover border-2 border-[#ca3538] shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className="w-20 h-20 rounded-full bg-[#ca3538]/20 border border-[#ca3538] flex items-center justify-center text-[#ca3538] text-3xl font-bold"
          style={{ display: user?.avatarUrl ? 'none' : 'flex' }}
        >
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs tracking-widest text-[#e04445] font-semibold uppercase">
            {user?.role || 'THÀNH VIÊN GALAXY'}
          </span>
          <h2 className="text-2xl font-bold text-white">
            Xin chào, {user?.fullName || user?.username}!
          </h2>
          <p className="text-sm text-[#9d9ea5]">{user?.email}</p>
        </div>

        <div className="w-full bg-[#212226] rounded-lg p-4 text-left text-xs space-y-2 border border-[#303135]">
          <div className="flex justify-between">
            <span className="text-[#9d9ea5]">Tài khoản:</span>
            <span className="font-semibold">{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9d9ea5]">Họ và tên:</span>
            <span>{user?.fullName || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9d9ea5]">Số điện thoại:</span>
            <span>{user?.phoneNumber || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9d9ea5]">Điểm tích lũy:</span>
            <span className="text-amber-400 font-semibold">{user?.loyaltyPoints ?? 0} điểm</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full h-11 bg-[#ca3538] hover:bg-[#b02e31] rounded-lg text-white font-medium text-sm transition-colors cursor-pointer"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Trang đăng ký độc lập */}
      <Route path="/dang-ky" element={<RegisterPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Trang đăng nhập & xác thực Google */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* Các trang chính thuộc luồng khách hàng với Header & Footer chung */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Navigate to="/lich-chieu" replace />} />
        <Route path="/lich-chieu" element={<ShowtimeSelectionPage />} />
        <Route path="/tai-khoan" element={<AccountPage />} />
        {/* ponytail: chưa chặn đăng nhập (business-rules: phải đăng nhập mới đặt vé); thêm PrivateRoute khi có AuthContext */}
        <Route
          path="/dat-ve/suat-chieu/:showtimeId/chon-ghe"
          element={<p className="py-24 text-center text-muted">Màn hình chọn ghế: làm ở task 6.2.1.2.</p>}
        />
        <Route path="*" element={<p className="py-24 text-center text-muted">Trang đang được xây dựng.</p>} />
      </Route>
    </Routes>
  );
}

export { AppRoutes };

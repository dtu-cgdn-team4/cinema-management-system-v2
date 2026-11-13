import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import GoogleCallbackPage from '@/features/auth/pages/GoogleCallbackPage';
import { useAuth } from '@/context/AuthContext';

/**
 * Trang chủ tạm thời hiển thị trạng thái đăng nhập thành công từ Backend
 */
const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0d0e10] text-[#f5f2ed] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#17181b] border border-[#303135] rounded-xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-[#ca3538]/20 border border-[#ca3538] flex items-center justify-center text-[#ca3538] text-2xl font-bold">
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs tracking-widest text-[#e04445] font-semibold uppercase">
            {user?.role || 'THÀNH VIÊN'}
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

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Route Đăng nhập */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* Trang chủ sau khi đăng nhập */}
      <Route path="/" element={<HomePage />} />

      {/* Các route phụ */}
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

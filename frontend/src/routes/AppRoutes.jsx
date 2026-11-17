import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import GoogleCallbackPage from '@/features/auth/pages/GoogleCallbackPage';
import CustomerLayout from '@/layouts/CustomerLayout';
import ShowtimeSelectionPage from '@/features/booking/pages/ShowtimeSelectionPage';
import AccountPage from '@/features/account/pages/AccountPage';

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

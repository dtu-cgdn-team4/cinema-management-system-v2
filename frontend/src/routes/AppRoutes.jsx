import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import GoogleCallbackPage from '@/features/auth/pages/GoogleCallbackPage';
import CustomerLayout from '@/layouts/CustomerLayout';
import SeatSelectionPage from '@/features/booking/pages/SeatSelectionPage';
import ShowtimeSelectionPage from '@/features/booking/pages/ShowtimeSelectionPage';
import AccountPage from '@/features/account/pages/AccountPage';
import AdminMovieListPage from '@/features/admin/pages/AdminMovieListPage';
import { useAuth } from '@/context/AuthContext';
import MovieListPage from '@/features/movies/pages/MovieListPage';
import MemberTicketsPage from '@/features/account/pages/MemberTicketsPage';

/** Bảo vệ các route quản trị: yêu cầu đã đăng nhập và có quyền ADMIN. */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0e10] text-sm text-[#9d9ea5]">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user?.role === 'ADMIN' || user?.roleCode === 'ADMIN';
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0d0e10] px-6 text-center text-[#f5f2ed]">
        <h1 className="text-xl font-bold">Không có quyền truy cập</h1>
        <p className="text-sm text-[#9d9ea5]">
          Khu vực quản trị chỉ dành cho tài khoản Quản trị viên (ADMIN).
        </p>
        <Link
          to="/lich-chieu"
          className="rounded-lg bg-[#ca3538] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b02e31]"
        >
          Về trang lịch chiếu
        </Link>
      </div>
    );
  }

  return children;
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

      {/* Các bước đặt vé dùng thanh điều hướng đặt vé riêng, không có footer (Figma "Trang chọn ghế") */}
      <Route path="/dat-ve/suat-chieu/:showtimeId/chon-ghe" element={<SeatSelectionPage />} />

      {/* Tuyến đường phân hệ Quản lý phim dành cho Quản trị viên */}
      <Route
        path="/admin/movies"
        element={
          <AdminRoute>
            <AdminMovieListPage />
          </AdminRoute>
        }
      />

      {/* Các trang chính thuộc luồng khách hàng với Header & Footer chung */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Navigate to="/trang-chu" replace />} />
        <Route path="/trang-chu" element={<p className="py-24 text-center text-muted">Trang chủ đang được xây dựng.</p>} />
        <Route path="/phim" element={<MovieListPage />} />
        <Route path="/lich-chieu" element={<ShowtimeSelectionPage />} />
        <Route path="/rap-chieu" element={<p className="py-24 text-center text-muted">Trang rạp chiếu đang được xây dựng.</p>} />
        <Route path="/tai-khoan" element={<AccountPage />} />
        <Route path="/tai-khoan/ve-da-dat" element={<MemberTicketsPage />} />
        <Route
          path="/dat-ve/suat-chieu/:showtimeId/thanh-toan"
          element={<p className="py-24 text-center text-muted">Đã giữ ghế. Màn hình thanh toán làm ở task sau.</p>}
        />
        <Route path="*" element={
          <div className="py-24 text-center max-w-md mx-auto space-y-4">
            <h2 className="text-4xl font-extrabold text-galaxy-red">404</h2>
            <p className="text-base font-semibold text-white">Trang không tồn tại</p>
            <p className="text-xs text-slate-400">
              Đường dẫn bạn yêu cầu không tìm thấy hoặc đã được di chuyển.
            </p>
            <div>
              <a
                href="/trang-chu"
                className="inline-block px-5 py-2 rounded-lg text-xs font-semibold text-white bg-galaxy-red hover:bg-galaxy-red/80 transition-colors"
              >
                Về trang chủ phim
              </a>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export { AppRoutes };

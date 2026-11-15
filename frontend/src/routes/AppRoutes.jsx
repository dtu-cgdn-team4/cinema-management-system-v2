import { Navigate, Route, Routes } from 'react-router-dom';
import RegisterPage from '../features/auth/pages/RegisterPage';
import SeatSelectionPage from '../features/booking/pages/SeatSelectionPage';
import ShowtimeSelectionPage from '../features/booking/pages/ShowtimeSelectionPage';
import CustomerLayout from '../layouts/CustomerLayout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Trang đăng ký dùng bố cục độc lập với layout khách hàng chung. */}
      <Route path="/dang-ky" element={<RegisterPage />} />

      {/* Các bước đặt vé dùng thanh điều hướng đặt vé riêng, không có footer (Figma "Trang chọn ghế") */}
      <Route path="/dat-ve/suat-chieu/:showtimeId/chon-ghe" element={<SeatSelectionPage />} />

      {/* Các trang chính thuộc luồng trải nghiệm khách hàng với Header & Footer chung */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Navigate to="/lich-chieu" replace />} />
        <Route path="/lich-chieu" element={<ShowtimeSelectionPage />} />
        <Route
          path="/dat-ve/suat-chieu/:showtimeId/thanh-toan"
          element={<p className="py-24 text-center text-muted">Đã giữ ghế. Màn hình thanh toán làm ở task sau.</p>}
        />
        <Route path="*" element={<p className="py-24 text-center text-muted">Trang đang được xây dựng.</p>} />
      </Route>
    </Routes>
  );
}

import { Navigate, Route, Routes } from 'react-router-dom';
import ShowtimeSelectionPage from '../features/booking/pages/ShowtimeSelectionPage';
import CustomerLayout from '../layouts/CustomerLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Navigate to="/lich-chieu" replace />} />
        <Route path="/lich-chieu" element={<ShowtimeSelectionPage />} />
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

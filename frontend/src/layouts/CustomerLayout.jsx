import { Navigate, Outlet } from 'react-router-dom';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import { useAuth } from '@/context/AuthContext';

/** Khung trang khách (Tailwind): header, nội dung, footer. */
export default function CustomerLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Ngăn người dùng lách luật vào trang chủ/mua vé khi chưa bổ sung đủ SĐT, ngày sinh, giới tính
  const isProfileIncomplete = Boolean(
    !isLoading && isAuthenticated && user && (!user.phoneNumber || !user.dateOfBirth || !user.gender)
  );

  if (isProfileIncomplete) {
    return <Navigate to="/dang-nhap?step=complete-profile" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

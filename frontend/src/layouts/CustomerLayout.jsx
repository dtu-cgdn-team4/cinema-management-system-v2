import { Outlet } from 'react-router-dom';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

/** Khung trang khách (Tailwind): header, nội dung, footer. */
export default function CustomerLayout() {
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

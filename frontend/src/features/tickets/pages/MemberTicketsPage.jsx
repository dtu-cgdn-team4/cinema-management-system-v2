import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAccountProfile } from '@/features/account/api/accountApi';
import { formatDate } from '@/utils/format';
import AccountSidebar from '@/features/account/components/AccountSidebar';
import TicketTable from '../components/TicketTable';
import useMemberTickets from '../hooks/useMemberTickets';

export default function MemberTicketsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { tickets, isLoading, error } = useMemberTickets();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isCurrent = true;
    getAccountProfile()
      .then((response) => {
        if (isCurrent) setProfileData(response?.data ?? response);
      })
      .catch(() => {
        if (isCurrent) setProfileData(null);
      });

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated]);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ngày tham gia hiển thị định dạng ngày/tháng/năm
  const joinDate = profileData?.joinedAt
    ? formatDate(profileData.joinedAt)
    : '12/03/2025';

  return (
    <div className="bg-page min-h-[calc(100vh-200px)] text-white">
      <div className="mx-auto max-w-304 px-4 xl:px-0 pt-6 pb-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted mb-6">
          <Link to="/" className="hover:text-white transition">
            Trang chủ
          </Link>
          <ChevronRight size={12} className="text-muted shrink-0" />
          <Link to="/tai-khoan" className="hover:text-white transition">
            Tài khoản
          </Link>
          <ChevronRight size={12} className="text-muted shrink-0" />
          <span className="text-white font-medium">Vé đã đặt</span>
        </nav>

        {/* Tiêu đề trang: | Quản lý tài khoản + Ngày thành viên */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4 mb-7">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-[2px] bg-[#ea384d] shrink-0" />
            <h1 className="font-display text-[26px] md:text-[30px] font-bold leading-9 text-white tracking-tight">
              Quản lý tài khoản
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Thành viên từ {joinDate}
          </p>
        </div>

        {/* Nội dung chính: Cột trái (Sidebar 280px) + Cột phải (Bảng vé) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <AccountSidebar />
          <TicketTable tickets={tickets} isLoading={isLoading} error={error} />
        </div>
      </div>
    </div>
  );
}

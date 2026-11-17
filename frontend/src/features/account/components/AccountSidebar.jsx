import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MENU = [
  { to: '/tai-khoan', label: 'Thông tin tài khoản' },
  { to: '/tai-khoan/lich-su-diem', label: 'Lịch sử điểm' },
  { to: '/tai-khoan/ve-da-dat', label: 'Vé đã đặt' },
];

export default function AccountSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const displayName = user?.fullName || user?.username || 'Thành viên';

  /* Lấy 2 ký tự đầu làm avatar */
  const initials = (() => {
    if (!user?.fullName) return 'U';
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  })();

  const memberCode = user?.memberCode || (user?.id ? `TV${String(user.id).padStart(7, '0')}` : 'TV0000000');

  return (
    <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
      {/* Card 1: Hồ sơ thành viên */}
      <div className="rounded-2xl border border-white/5 bg-[#12141c] p-6 flex flex-col items-center text-center gap-3.5 shadow-xl">
        {/* Avatar tròn màu đỏ cam */}
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full object-cover border-2 border-[#ea384d] shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className="w-20 h-20 rounded-full bg-[#e84142] flex items-center justify-center text-white text-2xl font-bold select-none shadow-lg shadow-[#ea384d]/20"
          style={{ display: user?.avatarUrl ? 'none' : 'flex' }}
        >
          {initials}
        </div>

        {/* Tên thành viên */}
        <h2 className="text-base font-bold text-white tracking-tight">
          {displayName}
        </h2>

        {/* Badge hạng Thành viên */}
        <div className="bg-[#24211a] border border-[#f59e0b]/40 px-3 py-0.5 rounded-full">
          <span className="text-[10px] tracking-wider font-bold text-[#f59e0b] uppercase">
            Thành viên
          </span>
        </div>

        {/* Điểm tích lũy */}
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="text-xl font-extrabold text-[#ea384d]">
            {(user?.loyaltyPoints ?? 0).toLocaleString('vi-VN')}
          </span>
          <span className="text-xs text-muted">điểm tích luỹ</span>
        </div>

        {/* Mã thành viên */}
        <p className="text-xs text-zinc-400">
          Mã thành viên: {memberCode}
        </p>

        {/* Nút đăng xuất */}
        <button
          type="button"
          onClick={logout}
          className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#191c28] hover:bg-[#202434] hover:border-white/20 py-2.5 px-4 text-xs font-semibold text-white/80 transition cursor-pointer"
        >
          <LogOut size={15} strokeWidth={1.8} />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Card 2: Menu điều hướng */}
      <div className="rounded-2xl border border-white/5 bg-[#12141c] p-2 flex flex-col gap-1 shadow-xl">
        {MENU.map(({ to, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`w-full text-xs font-semibold rounded-xl px-4 py-3.5 text-left transition block ${
                isActive
                  ? 'bg-[#251419] text-[#ea384d]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

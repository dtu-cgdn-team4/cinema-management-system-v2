import { Search, UserRound, LogOut } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  ['/phim', 'Phim'],
  ['/lich-chieu', 'Lịch chiếu'],
  ['/rap-chieu', 'Rạp chiếu'],
  ['/uu-dai', 'Ưu đãi'],
];

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-21.75 max-w-304 items-center justify-between gap-6 px-4 xl:px-0">
        <BrandLogo />
        <nav className="hidden gap-7.5 md:flex">
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-semibold transition hover:text-white ${isActive ? 'text-white' : 'text-muted'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <Link to="/phim" aria-label="Tìm phim" className="text-muted transition hover:text-white">
            <Search size={20} strokeWidth={1.6} absoluteStrokeWidth />
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/tai-khoan"
                className="flex h-12 items-center gap-2.5 rounded-xl border border-white/10 bg-card px-4 text-sm font-semibold whitespace-nowrap transition hover:border-white/20 text-[#f5f2ed]"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || user.username}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-[#ca3538]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className="w-7 h-7 rounded-full bg-[#ca3538]/20 border border-[#ca3538] flex items-center justify-center text-[#ca3538] text-xs font-bold"
                  style={{ display: user?.avatarUrl ? 'none' : 'flex' }}
                >
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user?.fullName || user?.username}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-card text-muted transition hover:text-[#ca3538] hover:border-white/20 cursor-pointer"
              >
                <LogOut size={18} strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex h-12 items-center gap-2.5 rounded-xl border border-white/10 bg-card px-5.5 text-sm font-semibold whitespace-nowrap transition hover:border-white/20"
            >
              <UserRound size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted" />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

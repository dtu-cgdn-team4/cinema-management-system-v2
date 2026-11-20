import { useEffect, useRef, useState } from 'react';
import { Search, UserRound, LogOut, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  ['/trang-chu', 'Trang chủ'],
  ['/phim', 'Phim'],
  ['/rap-chieu', 'Rạp chiếu'],
  ['/uu-dai', 'Ưu đãi'],
];

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location]);
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [menuOpen]);

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-304 items-center justify-between gap-2 px-4 sm:gap-4 lg:h-21.75 xl:px-0">
        <BrandLogo className="h-10 shrink-0 md:w-36.25" />
        <nav aria-label="Điều hướng chính" className="hidden gap-4 lg:flex xl:gap-7.5">
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
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          <Link to="/phim?focus=search" aria-label="Tìm phim" className="flex size-11 items-center justify-center rounded-lg text-muted transition hover:text-white focus-visible:outline-2 focus-visible:outline-brand">
            <Search size={20} strokeWidth={1.6} absoluteStrokeWidth />
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/tai-khoan"
                aria-label="Tài khoản của tôi"
                className="flex h-11 items-center gap-2.5 rounded-xl border border-white/10 bg-card px-2 text-sm font-semibold transition hover:border-white/20 text-[#f5f2ed] lg:h-12 lg:px-3"
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
                <span className="hidden max-w-28 truncate lg:block" title={user?.fullName || user?.username}>{user?.fullName || user?.username}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="Đăng xuất"
                className="hidden h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-card text-muted transition hover:text-[#ca3538] hover:border-white/20 cursor-pointer lg:flex"
              >
                <LogOut size={18} strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              aria-label="Đăng nhập"
              className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-card px-3 text-sm font-semibold whitespace-nowrap transition hover:border-white/20 lg:h-12 lg:px-4"
            >
              <UserRound size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          )}
          <button ref={menuButton} type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} onClick={() => setMenuOpen((open) => !open)}
            className="flex size-11 items-center justify-center rounded-lg text-white hover:bg-card focus-visible:outline-2 focus-visible:outline-brand lg:hidden">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Điều hướng trên điện thoại" className="border-t border-line bg-surface px-4 py-3 lg:hidden">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold ${isActive ? 'bg-brand/15 text-brand' : 'text-muted hover:bg-card hover:text-white'}`}>
              {label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <button type="button" onClick={() => { setMenuOpen(false); logout(); }}
              className="mt-2 flex min-h-11 w-full items-center gap-2 border-t border-line px-3 text-sm text-muted">
              <LogOut size={18} /> Đăng xuất
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

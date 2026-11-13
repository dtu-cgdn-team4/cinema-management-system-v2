import { Search, UserRound } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';

const NAV = [
  ['/phim', 'Phim'],
  ['/lich-chieu', 'Lịch chiếu'],
  ['/rap-chieu', 'Rạp chiếu'],
  ['/uu-dai', 'Ưu đãi'],
];

export default function SiteHeader() {
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
          <Link
            to="/dang-nhap"
            className="flex h-12 items-center gap-2.5 rounded-xl border border-white/10 bg-card px-5.5 text-sm font-semibold whitespace-nowrap transition hover:border-white/20"
          >
            <UserRound size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted" />
            Đăng nhập
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * Tên tệp: Trang danh sách quản lý phim (AdminMovieListPage.jsx)
 * Chức năng: Giao diện Task 3 (Sprint 1 - Mục 6.14.1.1), khớp thiết kế Figma 1524:3300 & 1308:13022:
 * - Bảng danh sách 10 cột: Poster, Tên phim, Thể loại, Thời lượng, Độ tuổi, Ngày khởi chiếu, Định dạng, Tổng suất chiếu, Trạng thái, Thao tác.
 * - 4 tab lọc trạng thái nhanh kèm số lượng động (Tất cả phim, Đang chiếu, Sắp chiếu, Ngừng chiếu).
 * - Tìm kiếm theo tên phim (debounce 300ms, phím tắt ⌘K), lọc thể loại từ API và lọc trạng thái.
 * - Xóa mềm qua hộp thoại xác nhận "Bạn có chắc chắn muốn ngừng chiếu bộ phim này?".
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Armchair,
  Bell,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ContactRound,
  Download,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '../../../utils/format';
import {
  extractErrorMessage,
  fetchAdminGenres,
  fetchAdminMovies,
  softDeleteAdminMovie,
} from '../api/adminMovieApi';
import {
  AGE_RATING_META,
  MOVIE_STATUS,
  MOVIE_STATUS_META,
} from '../api/mockMoviesData';
import MovieDetailModal from '../components/MovieDetailModal';
// Hộp thoại xóa mềm sẽ được tích hợp ở Đợt 2 (PR 2)

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả phim' },
  { key: MOVIE_STATUS.DANG_CHIEU, label: 'Đang chiếu' },
  { key: MOVIE_STATUS.SAP_CHIEU, label: 'Sắp chiếu' },
  { key: MOVIE_STATUS.NGUNG_CHIEU, label: 'Ngừng chiếu' },
];

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, active: false },
  { key: 'movies', label: 'Phim', icon: Clapperboard, active: true },
  { key: 'bookings', label: 'Đặt vé', icon: Ticket, active: false },
  { key: 'rooms', label: 'Phòng chiếu', icon: Armchair, active: false },
  { key: 'members', label: 'Thành viên', icon: Users, active: false },
  { key: 'staff', label: 'Nhân viên', icon: ContactRound, active: false },
  { key: 'stats', label: 'Thống kê', icon: ChartNoAxesCombined, active: false },
];

/**
 * Tính toán danh sách số trang cần hiển thị trên thanh phân trang (có dấu '...' rút gọn).
 * Ví dụ: [1, '...', 4, 5, 6, '...', 10] giúp giao diện gọn gàng khi số trang quá lớn.
 */
function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...');
    }
    result.push(sorted[i]);
  }
  return result;
}

export default function AdminMovieListPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const searchInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  const [keywordInput, setKeywordInput] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarMovieTotal, setSidebarMovieTotal] = useState(0);
  const [summaryCounts, setSummaryCounts] = useState({
    ALL: 0,
    [MOVIE_STATUS.DANG_CHIEU]: 0,
    [MOVIE_STATUS.SAP_CHIEU]: 0,
    [MOVIE_STATUS.NGUNG_CHIEU]: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [movieForDetail, setMovieForDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const showToast = useCallback((type, title) => {
    setToastMessage({ type, title });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  // Debounce từ khóa tìm kiếm để tránh gửi request liên tục mỗi lần gõ phím
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keywordInput);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keywordInput]);

  // Phím tắt Cmd/Ctrl + K để focus nhanh vào ô tìm kiếm phim
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tải danh sách thể loại từ Backend một lần khi mở trang
  useEffect(() => {
    let active = true;
    fetchAdminGenres()
      .then((list) => {
        if (active) setGenres(list);
      })
      .catch(() => {
        if (active) setGenres([]);
      });
    return () => {
      active = false;
    };
  }, []);

  /**
   * Tải danh sách phim từ Backend dựa theo bộ lọc (từ khóa, thể loại, tab trạng thái) và số trang.
   * Cập nhật đồng thời bảng danh sách phim và số lượng thống kê trên 4 tab.
   */
  const loadMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAdminMovies({
        keyword: debouncedKeyword,
        genreId: selectedGenreId,
        status: selectedStatus,
        page,
        size: pageSize,
      });
      setMovies(response.items);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setSummaryCounts(response.summaryCounts);
      if (!debouncedKeyword.trim() && selectedGenreId === 'ALL') {
        setSidebarMovieTotal(response.summaryCounts.ALL ?? 0);
      }
      if (response.page !== page) {
        setPage(response.page);
      }
    } catch (err) {
      const msg = await extractErrorMessage(err);
      showToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedKeyword, selectedGenreId, selectedStatus, page, pageSize, showToast]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  /**
   * Xử lý xác nhận xóa mềm bộ phim: Gọi API DELETE, làm mới bảng phim và hiển thị thông báo thành công.
   */
  const handleConfirmSoftDelete = async (movieId) => {
    setIsDeleting(true);
    try {
      await softDeleteAdminMovie(movieId);
      const deletedMovie = movieToDelete;
      setMovieToDelete(null);
      await loadMovies();
      showToast(
        'success',
        `Đã ngừng phát hành "${deletedMovie?.title ?? 'bộ phim'}" (${deletedMovie?.code ?? ''})`,
      );
    } catch (err) {
      const msg = await extractErrorMessage(err);
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Đặt lại toàn bộ bộ lọc tìm kiếm về mặc định và quay lại trang 1.
   */
  const handleResetFilters = () => {
    setKeywordInput('');
    setDebouncedKeyword('');
    setSelectedGenreId('ALL');
    setSelectedStatus('ALL');
    setPage(1);
  };

  /**
   * Xuất danh sách phim đang xem ra tệp CSV (thêm ký tự UTF-8 BOM \uFEFF để mở tiếng Việt không bị lỗi font trên Excel).
   */
  const handleExportCsv = () => {
    if (!movies.length) {
      showToast('info', 'Không có dữ liệu phim trong trang hiện tại để xuất.');
      return;
    }

    const headers = [
      'Mã phim',
      'Tên phim',
      'Thể loại',
      'Thời lượng (phút)',
      'Độ tuổi',
      'Ngày khởi chiếu',
      'Định dạng',
      'Tổng suất chiếu',
      'Trạng thái',
    ];

    const rows = movies.map((m) => [
      m.code,
      `"${String(m.title).replace(/"/g, '""')}"`,
      `"${m.genres.join(', ')}"`,
      m.duration,
      m.ageRating,
      m.releaseDate ? formatDate(m.releaseDate) : '',
      `"${m.formats.join(', ')}"`,
      m.totalShowtimes,
      MOVIE_STATUS_META[m.status]?.label ?? m.status,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'danh-sach-phim-galaxy.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'Đã xuất danh sách phim ra file CSV/Excel.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const paginationItems = useMemo(
    () => getPaginationItems(page, totalPages),
    [page, totalPages],
  );

  const startItemIndex = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItemIndex = Math.min(page * pageSize, totalElements);
  const displayName = user?.fullName || user?.username || 'Quản trị viên';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className="flex min-h-screen bg-[#F5F6F8] font-sans text-slate-900">
      {/* Sidebar trái khớp Figma Galaxy Cinema Management (#14151A) */}
      <aside className="flex w-52 shrink-0 flex-col justify-between bg-[#14151A] text-slate-300 lg:w-56">
        <div>
          {/* Thương hiệu */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E11D48] text-white shadow-sm">
              <Clapperboard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold tracking-wider text-white">GALAXY</p>
              <p className="truncate text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Cinema Management
              </p>
            </div>
          </div>

          {/* Menu điều hướng */}
          <div className="px-3 py-5">
            <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Không gian quản trị
            </p>
            <nav className="mt-3 space-y-1" aria-label="Menu quản trị">
              {NAV_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.active;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (!isActive) {
                        showToast('info', `Phân hệ "${item.label}" thuộc phạm vi task khác.`);
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition ${
                      isActive
                        ? 'bg-[#E11D48] font-semibold text-white shadow-xs'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <IconComponent className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {item.key === 'movies' && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {sidebarMovieTotal}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Chân sidebar */}
        <div className="border-t border-white/10 p-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300">
            <HelpCircle className="h-4 w-4 shrink-0 text-slate-400" />
            <span>Trung tâm hỗ trợ</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
            <span>Hệ thống hoạt động ổn định</span>
          </div>
          <p className="mt-1 pl-4 text-[10px] text-slate-500">Galaxy Admin</p>
        </div>
      </aside>

      {/* Vùng nội dung chính */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Quản lý phim</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">Danh sách phim</span>
          </nav>

          <div className="flex items-center gap-3.5">
            {/* Thanh tìm kiếm nhanh trên header (⌘ K) */}
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => {
                  setKeywordInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm kiếm toàn hệ thống..."
                aria-label="Tìm kiếm toàn hệ thống"
                className="w-60 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-11 pl-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#E11D48] focus:bg-white focus:outline-none"
              />
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                ⌘ K
              </span>
            </div>

            <button
              type="button"
              onClick={() => showToast('info', 'Hiện chưa có thông báo hệ thống mới.')}
              aria-label="Thông báo"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Hồ sơ quản trị viên & Đăng xuất */}
            <div className="relative border-l border-slate-200 pl-3.5">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-lg py-1 pr-1 text-left transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {avatarInitial}
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[11px] text-slate-500">Quản trị viên</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Nội dung chính */}
        <main className="flex-1 px-6 py-6 lg:px-8">
          {/* Tiêu đề trang + nút Thêm mới phim */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý phim</h1>
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {summaryCounts.ALL} phim
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Danh sách và quản lý trạng thái phát hành các bộ phim
              </p>
            </div>

            <div className="flex items-center gap-3">
              {toastMessage && (
                <div
                  role="status"
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-xs transition ${
                    toastMessage.type === 'success'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : toastMessage.type === 'error'
                        ? 'border-rose-300 bg-rose-50 text-rose-800'
                        : 'border-sky-300 bg-sky-50 text-sky-800'
                  }`}
                >
                  <span>{toastMessage.title}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  showToast('info', 'Chức năng Thêm mới phim thuộc phạm vi Task 4 (6.14.1.2).')
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E11D48] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-rose-700"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm mới phim</span>
              </button>
            </div>
          </div>

          {/* Thẻ bảng dữ liệu */}
          <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            {/* 4 Tab trạng thái */}
            <div className="flex flex-wrap items-center gap-6 border-b border-slate-200 px-6 pt-3">
              {STATUS_TABS.map((tab) => {
                const isSelected = selectedStatus === tab.key;
                const count = summaryCounts[tab.key] ?? 0;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(tab.key);
                      setPage(1);
                    }}
                    className={`relative flex items-center gap-2 pb-3 text-xs font-semibold transition ${
                      isSelected
                        ? 'border-b-2 border-[#E11D48] text-[#E11D48]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                        isSelected
                          ? 'bg-rose-50 font-bold text-[#E11D48]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Thanh tìm kiếm & bộ lọc */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-3.5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={keywordInput}
                    onChange={(e) => {
                      setKeywordInput(e.target.value);
                      setPage(1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setDebouncedKeyword(keywordInput);
                        setPage(1);
                      }
                    }}
                    placeholder="Tìm kiếm theo tên phim..."
                    aria-label="Tìm kiếm theo tên phim"
                    className="w-64 rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#E11D48] focus:outline-none"
                  />
                  {keywordInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setKeywordInput('');
                        setDebouncedKeyword('');
                        setPage(1);
                      }}
                      aria-label="Xóa từ khóa tìm kiếm"
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Bộ lọc thể loại từ API */}
                <select
                  aria-label="Lọc theo thể loại"
                  value={selectedGenreId}
                  onChange={(e) => {
                    setSelectedGenreId(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#E11D48] focus:outline-none"
                >
                  <option value="ALL">Tất cả thể loại</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={String(genre.id)}>
                      {genre.name}
                    </option>
                  ))}
                </select>

                {/* Bộ lọc trạng thái */}
                <select
                  aria-label="Lọc theo trạng thái"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#E11D48] focus:outline-none"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value={MOVIE_STATUS.DANG_CHIEU}>Đang chiếu</option>
                  <option value={MOVIE_STATUS.SAP_CHIEU}>Sắp chiếu</option>
                  <option value={MOVIE_STATUS.NGUNG_CHIEU}>Ngừng chiếu</option>
                </select>
              </div>

              {/* Xuất Excel & Làm mới */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Xuất Excel</span>
                </button>
                <button
                  type="button"
                  onClick={loadMovies}
                  disabled={isLoading}
                  title="Làm mới danh sách phim"
                  aria-label="Làm mới danh sách phim"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bảng dữ liệu 10 cột */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold tracking-wider text-slate-500">
                    <th className="py-3 pr-2 pl-6">Poster</th>
                    <th className="px-3 py-3">Tên phim</th>
                    <th className="px-3 py-3">Thể loại</th>
                    <th className="px-3 py-3">Thời lượng</th>
                    <th className="px-3 py-3">Độ tuổi</th>
                    <th className="px-3 py-3">Ngày khởi chiếu</th>
                    <th className="px-3 py-3">Định dạng</th>
                    <th className="px-3 py-3">Tổng suất chiếu</th>
                    <th className="px-3 py-3">Trạng thái</th>
                    <th className="py-3 pr-6 pl-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {isLoading ? (
                    Array.from({ length: pageSize }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="py-3.5 pr-2 pl-6">
                          <div className="h-14 w-10 rounded-md bg-slate-200" />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="h-4 w-44 rounded bg-slate-200" />
                          <div className="mt-1.5 h-3 w-20 rounded bg-slate-100" />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="h-3 w-24 rounded bg-slate-200" />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="h-3 w-16 rounded bg-slate-200" />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="h-5 w-10 rounded bg-slate-200" />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="h-3 w-20 rounded bg-slate-200" />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="h-3 w-12 rounded bg-slate-200" />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="h-3 w-8 rounded bg-slate-200" />
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="h-5 w-20 rounded-full bg-slate-200" />
                        </td>
                        <td className="py-3.5 pr-6 pl-3 text-right">
                          <div className="inline-flex gap-2">
                            <div className="h-7 w-7 rounded bg-slate-200" />
                            <div className="h-7 w-7 rounded bg-slate-200" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : movies.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Search className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-800">
                          Không tìm thấy phim phù hợp
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Thử từ khóa khác hoặc xóa bộ lọc đang chọn.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                        >
                          <span>Xóa tìm kiếm</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    movies.map((movie) => {
                      const statusMeta =
                        MOVIE_STATUS_META[movie.status] ?? MOVIE_STATUS_META.DANG_CHIEU;
                      const ageMeta = AGE_RATING_META[movie.ageRating] ?? {
                        label: movie.ageRating || '—',
                        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                      };
                      const isStopped = movie.status === MOVIE_STATUS.NGUNG_CHIEU;

                      return (
                        <tr key={movie.id} className="group transition hover:bg-slate-50/80">
                          <td className="py-3.5 pr-2 pl-6">
                            <button
                              type="button"
                              onClick={() => setMovieForDetail(movie)}
                              title="Bấm để xem chi tiết phim"
                              className="block focus:outline-none"
                            >
                              {movie.posterUrl ? (
                                <img
                                  src={movie.posterUrl}
                                  alt={`Poster ${movie.title}`}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  className="h-14 w-10 rounded-md border border-slate-200 object-cover shadow-2xs transition group-hover:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-14 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-slate-400">
                                  <Clapperboard className="h-4 w-4" />
                                </div>
                              )}
                            </button>
                          </td>

                          <td className="px-3 py-3.5">
                            <button
                              type="button"
                              onClick={() => setMovieForDetail(movie)}
                              className="text-left font-bold text-slate-900 transition group-hover:text-[#E11D48]"
                            >
                              {movie.title}
                            </button>
                            <p className="mt-0.5 text-[11px] text-slate-500">{movie.code}</p>
                          </td>

                          <td className="px-3 py-3.5 text-slate-600">
                            {movie.genres.length > 0 ? movie.genres.join(', ') : '—'}
                          </td>

                          <td className="px-3 py-3.5 font-medium text-slate-700">
                            {movie.duration} phút
                          </td>

                          <td className="px-3 py-3.5">
                            <span
                              className={`inline-flex items-center justify-center rounded border px-2 py-0.5 text-[11px] font-bold ${ageMeta.badgeClass}`}
                            >
                              {ageMeta.label}
                            </span>
                          </td>

                          <td className="px-3 py-3.5 font-medium text-slate-700">
                            {movie.releaseDate ? formatDate(movie.releaseDate) : '—'}
                          </td>

                          <td className="px-3 py-3.5 text-slate-600">
                            {movie.formats.join(', ')}
                          </td>

                          <td className="px-3 py-3.5 font-bold text-slate-900">
                            {movie.totalShowtimes}
                          </td>

                          <td className="px-3 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.badgeClass}`}
                            >
                              {statusMeta.label}
                            </span>
                          </td>

                          <td className="py-3.5 pr-6 pl-3 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  showToast(
                                    'info',
                                    'Chức năng Chỉnh sửa phim thuộc phạm vi Task 4 (6.14.1.3).',
                                  )
                                }
                                title="Chỉnh sửa phim"
                                aria-label={`Chỉnh sửa phim ${movie.title}`}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                disabled={isStopped}
                                onClick={() =>
                                  showToast(
                                    'info',
                                    'Chức năng ngừng phát hành (xóa mềm) sẽ được kích hoạt ở Đợt 2 (PR 2).',
                                  )
                                }
                                title={
                                  isStopped
                                    ? 'Phim đã ở trạng thái Ngừng chiếu'
                                    : 'Ngừng phát hành phim (Xóa mềm - Đợt 2)'
                                }
                                aria-label={`Ngừng phát hành phim ${movie.title}`}
                                className={`rounded-full p-1.5 transition ${
                                  isStopped
                                    ? 'cursor-not-allowed bg-slate-200 text-slate-500 opacity-75'
                                    : 'text-slate-500 hover:bg-rose-50 hover:text-[#E11D48]'
                                }`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-3.5 text-xs text-slate-600">
              <p>
                Hiển thị <span className="font-semibold text-slate-900">{startItemIndex}</span> -{' '}
                <span className="font-semibold text-slate-900">{endItemIndex}</span> trên tổng số{' '}
                <span className="font-semibold text-slate-900">{totalElements}</span> phim
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Số dòng / trang</span>
                  <select
                    aria-label="Số dòng trên mỗi trang"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-[#E11D48] focus:outline-none"
                  >
                    <option value={6}>6</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Trang trước"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  {paginationItems.map((item, idx) =>
                    item === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        className={`min-w-[28px] rounded-lg px-2 py-1 font-semibold transition ${
                          item === page
                            ? 'border border-rose-200 bg-rose-50 text-[#E11D48]'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Trang sau"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lưu ý xóa mềm khớp Figma */}
            <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50/70 px-6 py-3 text-[11px] text-slate-500">
              <Trash2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>
                Ngừng phát hành: chỉ ẩn phim khỏi lịch chiếu mới. Dữ liệu phim và lịch sử đặt vé vẫn
                được lưu giữ.
              </span>
            </div>
          </section>
        </main>
      </div>

      {/* Hộp thoại xem chi tiết phim */}
      <MovieDetailModal
        movie={movieForDetail}
        isOpen={Boolean(movieForDetail)}
        onClose={() => setMovieForDetail(null)}
        onRequestStopRelease={() =>
          showToast(
            'info',
            'Chức năng ngừng phát hành (xóa mềm) sẽ được kích hoạt ở Đợt 2 (PR 2).',
          )
        }
      />
    </div>
  );
}

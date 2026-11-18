import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight, Clock, Calendar, Play, X, Ticket,
  MapPin, Film, ChevronLeft, ChevronRight as ChevronRightIcon,
  Loader2, AlertCircle, Image as ImageIcon, ArrowRight, Bookmark, Users,
} from 'lucide-react';
import AgeBadge from '@/components/common/AgeBadge';
import { movieDetailApi } from '../api/movieDetailApi';
import { errorMessage } from '@/services/apiClient';

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */
function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatTime(dtStr) {
  if (!dtStr) return '—';
  return new Date(dtStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatVND(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}
function getStatusInfo(status) {
  switch (status) {
    case 'NOW_SHOWING': return { label: 'Đang chiếu', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    case 'COMING_SOON': return { label: 'Sắp chiếu',  cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
    case 'ENDED':       return { label: 'Đã kết thúc', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
    default:            return { label: status || '—', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  }
}
function getDayLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(d); target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return 'HÔM NAY';
  const days = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
  return days[d.getDay()];
}

/* ═══════════════════════════════════════
   TRAILER MODAL
═══════════════════════════════════════ */
function TrailerModal({ url, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const embedUrl = (() => {
    if (!url) return '';
    try {
      const u = new URL(url);
      const hostname = u.hostname.toLowerCase();
      const youtubeHosts = new Set([
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtube-nocookie.com',
        'www.youtube-nocookie.com',
        'youtu.be',
      ]);
      if (!youtubeHosts.has(hostname)) return '';

      const videoId = hostname === 'youtu.be'
        ? u.pathname.split('/').filter(Boolean)[0]
        : u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      if (!videoId || !/^[\w-]{11}$/.test(videoId)) return '';
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } catch {
      // Invalid URLs are not embedded.
      return '';
    }
  })();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-3 sm:p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        {embedUrl ? (
          <iframe src={embedUrl} title={`Trailer – ${title}`} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs sm:text-sm">Không thể phát trailer này.</div>
        )}
        <button onClick={onClose} className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer" aria-label="Đóng">
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

function GalleryModal({ images, title, activeIndex, onClose, onChange }) {
  const activeImage = images[activeIndex];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange((activeIndex - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') onChange((activeIndex + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeIndex, images.length, onChange, onClose]);

  if (!activeImage) return null;

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-black/95 p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div className="relative flex max-h-full w-full max-w-6xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
        <img src={activeImage} alt={`${title} – hình ${activeIndex + 1}`} className="max-h-[85vh] max-w-full rounded-xl object-contain" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onChange((activeIndex - 1 + images.length) % images.length)}
              aria-label="Xem ảnh trước"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onChange((activeIndex + 1) % images.length)}
              aria-label="Xem ảnh tiếp theo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
          {activeIndex + 1} / {images.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thư viện ảnh"
          className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SECTION HEADING (Vạch đỏ bên trái)
═══════════════════════════════════════ */
function SectionHeading({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3.5 sm:mb-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="w-1 sm:w-1.5 h-5 sm:h-6 rounded-full bg-brand shrink-0" />
        <h2 className="text-base sm:text-xl font-bold text-white tracking-wide">{children}</h2>
      </div>
      {right && <span className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">{right}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════ */
function HeroSection({ movie, onWatchTrailer, onBookNow }) {
  const status = getStatusInfo(movie.screeningStatus);
  const isNowShowing = movie.screeningStatus === 'NOW_SHOWING';

  return (
    <div className="relative w-full overflow-hidden border-b border-line/40">
      {/* Backdrop blur nền */}
      {(movie.backdropUrl || movie.posterUrl) && (
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 blur-lg opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-page via-page/85 to-page/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-page via-page/60 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-8 sm:pb-12 md:pb-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 mb-4 sm:mb-6 flex-wrap">
          <Link to="/trang-chu" className="hover:text-white transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600 shrink-0" />
          <Link to="/phim" className="hover:text-white transition-colors">Phim đang chiếu</Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600 shrink-0" />
          <span className="text-slate-200 font-medium line-clamp-1 max-w-[140px] sm:max-w-md">{movie.title}</span>
        </nav>

        {/* Poster + Thông tin */}
        <div className="flex flex-row gap-3.5 sm:gap-6 md:gap-10 items-start">
          {/* Poster: nhỏ bên trái trên mobile, to hơn trên desktop */}
          <div className="shrink-0 w-28 sm:w-48 md:w-56 self-start">
            <div className="aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-black/90">
              {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Film className="w-10 h-10 text-slate-600" /></div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2 sm:space-y-4 min-w-0 w-full">
            {/* Badges hàng 1 */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {movie.ageRating && <AgeBadge rating={movie.ageRating} size="sm" className="sm:text-xs" />}
              <span className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${status.cls}`}>{status.label}</span>
              {movie.format && (
                <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">{movie.format}</span>
              )}
            </div>

            {/* Tiêu đề */}
            <div>
              <h1 className="text-base sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">{movie.title}</h1>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="mt-0.5 text-[11px] sm:text-sm text-slate-400 italic">{movie.originalTitle}</p>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-y-1 gap-x-4 text-[11px] sm:text-sm text-slate-300">
              {movie.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-brand shrink-0" />
                  {formatDuration(movie.duration)}
                </span>
              )}
              {movie.releaseDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-brand shrink-0" />
                  {formatDate(movie.releaseDate)}
                </span>
              )}
              {movie.genres?.length > 0 && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Film className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                  <span className="line-clamp-1">{movie.genres.map(g => g.name).join(' · ')}</span>
                </span>
              )}
            </div>

            {/* Phụ đề */}
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Ngôn ngữ: Phụ đề tiếng Việt</p>

            {/* Mô tả ngắn - ẩn trên mobile, hiện từ sm */}
            {movie.description && (
              <p className="hidden sm:block text-sm text-slate-300/90 leading-relaxed line-clamp-3 max-w-2xl">{movie.description}</p>
            )}

            {/* Khuyến cáo độ tuổi - ẩn trên mobile */}
            {movie.ageRating && (
              <p className="hidden sm:flex text-xs text-amber-400/80 items-center gap-1.5">
                <span>⚠</span>
                Khuyến cáo chỉ dành cho khán giả từ {movie.ageRating.replace(/\D/g, '') || '13'} tuổi trở lên.
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 pt-0.5 sm:pt-2">
              {isNowShowing && (
                <button
                  onClick={onBookNow}
                  className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-black text-white bg-gradient-to-r from-brand to-[#FF4D6D] hover:from-[#E61E43] hover:to-brand shadow-lg shadow-brand/30 transition-all hover:scale-[1.02] active:scale-100 cursor-pointer"
                >
                  <Ticket className="w-3 h-3 sm:w-4 sm:h-4" />
                  Đặt vé ngay
                </button>
              )}
              {movie.trailerUrl && (
                <button
                  onClick={onWatchTrailer}
                  className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all hover:border-white/40 backdrop-blur-sm cursor-pointer"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  <span className="hidden sm:inline">Xem trailer</span>
                  <span className="sm:hidden">Trailer</span>
                </button>
              )}
              <button
                className="p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Lưu phim"
              >
                <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mô tả & khuyến cáo - chỉ hiện trên mobile, bên dưới khối poster+info */}
        <div className="sm:hidden mt-3 space-y-2">
          {movie.description && (
            <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-4">{movie.description}</p>
          )}
          {movie.ageRating && (
            <p className="text-[10px] text-amber-400/80 flex items-center gap-1.5">
              <span>⚠</span>
              Khuyến cáo chỉ dành cho khán giả từ {movie.ageRating.replace(/\D/g, '') || '13'} tuổi trở lên.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   TAB NAVIGATION
═══════════════════════════════════════ */
const TABS = [
  { id: 'info',      label: 'Tổng quan' },
  { id: 'trailer',  label: 'Trailer & Hình ảnh' },
  { id: 'showtimes',label: 'Lịch chiếu' },
  { id: 'related',  label: 'Phim liên quan' },
];
function TabNav({ active, onChange }) {
  return (
    <div className="border-b border-line sticky top-0 z-30 bg-page/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                active === tab.id
                  ? 'border-brand text-white'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   INFO SECTION (Tổng quan)
═══════════════════════════════════════ */
function InfoSection({ movie }) {
  const infoRows = [
    ['Phim',           movie.title],
    ['Khởi chiếu',     formatDate(movie.releaseDate)],
    ['Quốc gia',       movie.country || 'Hoa Kỳ'],
    ['Diễn viên',      movie.actors?.slice(0, 4).join(', ')],
    ['Đạo diễn',       movie.director],
    ['Nhà phát hành',  movie.productionCompany || movie.distributor],
    ['Phân loại',      movie.ageRating],
    ['Thời lượng',     formatDuration(movie.duration)],
    ['Định dạng',      movie.format || '2D Digital'],
  ].filter(([, v]) => v);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
      {/* Left: Thông tin phim */}
      <div className="md:col-span-2 bg-card rounded-xl sm:rounded-2xl border border-line p-4 sm:p-6 shadow-lg shadow-black/40">
        <SectionHeading>Thông tin phim</SectionHeading>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2.5 sm:gap-y-3.5 text-xs sm:text-sm">
          {infoRows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</dt>
              <dd className="text-slate-200 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {movie.description && (
          <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-line">
            <dt className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 sm:mb-2">Nội dung phim</dt>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{movie.description}</p>
          </div>
        )}
      </div>

      {/* Right: Dàn diễn viên */}
      <div className="bg-card rounded-xl sm:rounded-2xl border border-line p-4 sm:p-6 shadow-lg shadow-black/40">
        <SectionHeading>Dàn diễn viên</SectionHeading>
        {movie.actors?.length > 0 ? (
          <div className="space-y-2.5 sm:space-y-3">
            {movie.actors.map((actor, i) => (
              <div key={i} className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-200 shrink-0 uppercase">
                  {actor.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-slate-200 font-medium truncate">{actor}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">Diễn viên</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 sm:py-6">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Thông tin diễn viên chưa được cập nhật.</p>
          </div>
        )}

        {movie.director && (
          <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-line">
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 sm:mb-2">Đạo diễn</p>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-[10px] sm:text-xs font-bold text-brand shrink-0 uppercase">
                {movie.director.charAt(0)}
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">{movie.director}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">Đạo diễn</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   TRAILER & HÌNH ẢNH SECTION
═══════════════════════════════════════ */
function getGalleryImages(movie) {
  const rawGallery = movie.galleryImages?.length > 0
    ? movie.galleryImages
    : [movie.backdropUrl, movie.posterUrl].filter(Boolean);
  const uniqueImages = [...new Map(rawGallery.map(u => [u, u])).values()];

  return uniqueImages.length >= 2
    ? uniqueImages.slice(0, 2)
    : uniqueImages.length === 1
      ? [uniqueImages[0], uniqueImages[0]]
      : [];
}

function TrailerSection({ movie, onWatchTrailer, onViewImage }) {
  const galleryImages = getGalleryImages(movie);

  return (
    <div>
      <SectionHeading right={movie.title ? `Thế giới ${movie.title} trên màn ảnh rộng` : undefined}>
        Trailer &amp; Hình ảnh
      </SectionHeading>

      <div className="grid grid-cols-1 items-stretch gap-2.5 sm:gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Trailer một bên, hai ảnh xếp dọc ở bên còn lại. */}
        <div
          onClick={movie.trailerUrl ? onWatchTrailer : undefined}
          onKeyDown={movie.trailerUrl ? (event) => { if (event.key === 'Enter' || event.key === ' ') onWatchTrailer(); } : undefined}
          role={movie.trailerUrl ? 'button' : undefined}
          tabIndex={movie.trailerUrl ? 0 : undefined}
          className={`relative aspect-video min-w-0 overflow-hidden rounded-xl border border-line bg-slate-900 shadow-xl shadow-black/50 sm:rounded-2xl ${movie.trailerUrl ? 'group cursor-pointer' : ''}`}
        >
          {(movie.backdropUrl || movie.posterUrl) ? (
            <img
              src={movie.backdropUrl || movie.posterUrl}
              alt={`Trailer – ${movie.title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <Film className="w-10 h-10 sm:w-14 sm:h-14 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors" />

          {/* Play button */}
          {movie.trailerUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-full bg-brand/90 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-brand transition-transform duration-300">
                <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-white text-white ml-0.5 sm:ml-1" />
              </div>
            </div>
          )}

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/90 to-transparent">
            <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Trailer</p>
            <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">{movie.title}</p>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-2 sm:gap-3">
          {galleryImages.length > 0 ? (
            galleryImages.map((img, i) => (
              <div
                key={i}
                className="relative aspect-video min-h-0 min-w-0 overflow-hidden rounded-lg border border-line bg-slate-900 shadow-md shadow-black/40 sm:rounded-xl sm:shadow-lg"
              >
                <button type="button" onClick={() => onViewImage(i)} className="group h-full w-full cursor-zoom-in" aria-label={`Xem hình ${i + 1} của ${movie.title}`}>
                  <img
                    src={img}
                    alt={`Hình ảnh ${i + 1} – ${movie.title}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
                {/* Nút "Xem hình ảnh" ở ảnh thứ 2 */}
                {i === 1 && (
                  <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5">
                    <button
                      type="button"
                      onClick={() => onViewImage(i)}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-black/75 backdrop-blur-sm text-[10px] sm:text-xs font-semibold text-white border border-white/20 hover:bg-black/95 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Xem hình ảnh</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            [0, 1].map(i => (
              <div key={i} className="flex-1 aspect-video md:aspect-auto rounded-lg sm:rounded-xl bg-slate-900 border border-line flex items-center justify-center">
                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SHOWTIMES SECTION (3 bước + sidebar)
═══════════════════════════════════════ */
function ShowtimesSection({ movieId, movie }) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedCity, setSelectedCity]       = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const [selectedSlot, setSelectedSlot]       = useState(null);

  // Tạo 7 ngày bắt đầu từ HÔM NAY
  const next7Days = (() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      days.push(`${yyyy}-${mm}-${dd}`);
    }
    return days;
  })();

  const [selectedDate, setSelectedDate] = useState(next7Days[0]);

  useEffect(() => {
    if (!movieId) return;
    const ctrl = new AbortController();
    setLoading(true); setError(''); setSelectedSlot(null);
    movieDetailApi.getShowtimes(
      movieId,
      { date: selectedDate, city: selectedCity || undefined, cinemaId: selectedCinemaId || undefined },
      ctrl.signal
    )
      .then(res => {
        setData(res);
        if (!selectedCity && res.cities?.length > 0) {
          setSelectedCity(res.cities[0]);
        }
      })
      .catch(err => { if (!ctrl.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [movieId, selectedDate, selectedCity, selectedCinemaId]);

  const filteredCinemas = data?.cinemas || [];

  const selectedCinemaName = filteredCinemas.find(c => c.id === selectedCinemaId)?.name
    ?? filteredCinemas[0]?.name ?? '';

  const displayDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  const handleSelectSlot = (room, slot) => {
    if (slot.soldOut) return;
    setSelectedSlot({ room, slot });
  };

  const handleContinue = () => {
    alert('Chức năng đặt vé đang được phát triển. Vui lòng quay lại sau!');
  };

  return (
    <div>
      <SectionHeading>Lịch chiếu</SectionHeading>

      {loading ? (
        <div className="flex items-center justify-center py-12 sm:py-16 gap-2.5 sm:gap-3 text-slate-400">
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-brand" />
          <span className="text-xs sm:text-sm">Đang tải lịch chiếu...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">

          {/* ── CỘT TRÁI: 3 bước chọn ── */}
          <div className="flex-1 min-w-0 w-full space-y-3.5 sm:space-y-4">

            {/* BƯỚC 1: CHỌN NGÀY XEM PHIM */}
            <div className="bg-card rounded-xl sm:rounded-2xl border border-line p-3.5 sm:p-5 shadow-lg shadow-black/40">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shrink-0">1</span>
                  Chọn ngày xem phim
                </p>
                <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1 sm:gap-1.5 font-medium">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand" />
                  Tháng {new Date(selectedDate).getMonth() + 1}/{new Date(selectedDate).getFullYear()}
                </span>
              </div>

              {/* Hàng 7 ngày: co giãn vừa vặn trên mobile */}
              <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {next7Days.map(d => {
                  const dateObj = new Date(d);
                  const isSelected = d === selectedDate;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                      className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg sm:rounded-xl border text-xs font-bold shrink-0 min-w-[56px] sm:min-w-[74px] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand border-brand text-white shadow-lg shadow-brand/30'
                          : 'bg-surface border-line text-slate-300 hover:border-brand/40 hover:text-white'
                      }`}
                    >
                      <span className="text-[9px] sm:text-[10px] font-semibold mb-0.5">{getDayLabel(d)}</span>
                      <span className="text-lg sm:text-2xl font-black leading-tight my-0.5">{dateObj.getDate()}</span>
                      <span className="text-[9px] sm:text-[10px] opacity-75">Tháng {dateObj.getMonth() + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BƯỚC 2: CHỌN VỊ TRÍ & CỤM RẠP */}
            <div className="bg-card rounded-xl sm:rounded-2xl border border-line p-3.5 sm:p-5 shadow-lg shadow-black/40">
              {/* Header: Tiêu đề + Dropdown khu vực */}
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 flex-wrap">
                <p className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shrink-0">2</span>
                  Chọn vị trí &amp; cụm rạp
                </p>

                {data?.cities?.length > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-slate-400 font-medium hidden sm:inline">Khu vực:</span>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setSelectedCinemaId(null);
                        setSelectedSlot(null);
                      }}
                      className="bg-surface border border-line rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold text-white appearance-none cursor-pointer hover:border-brand/50 transition-colors focus:outline-none focus:border-brand pr-6 sm:pr-7"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ea384d' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.4rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.1em 1.1em',
                      }}
                    >
                      {data.cities.map(city => {
                        const count = data.cinemas?.filter(c => c.city === city).length || data.cinemas?.length || 0;
                        return (
                          <option key={city} value={city} className="bg-slate-900 text-white">
                            {city} ({count} rạp)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Danh sách các cụm rạp */}
              {filteredCinemas.length > 0 ? (
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {filteredCinemas.map(cinema => {
                    const isSelected = selectedCinemaId === cinema.id || (!selectedCinemaId && cinema === filteredCinemas[0]);
                    return (
                      <button
                        key={cinema.id}
                        type="button"
                        onClick={() => { setSelectedCinemaId(cinema.id); setSelectedSlot(null); }}
                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand border-brand text-white shadow-md shadow-brand/25'
                            : 'bg-surface border-line text-slate-300 hover:border-brand/40 hover:text-white'
                        }`}
                      >
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand shrink-0" />
                        {cinema.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] sm:text-xs text-slate-500 py-1">Không có rạp nào tại khu vực này.</p>
              )}
            </div>

            {/* BƯỚC 3: SUẤT CHIẾU CÓ SẴN */}
            <div className="bg-card rounded-xl sm:rounded-2xl border border-line p-3.5 sm:p-5 shadow-lg shadow-black/40">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shrink-0">3</span>
                  {selectedCinemaName ? (
                    <>Suất chiếu tại <span className="text-brand normal-case font-bold ml-1">{selectedCinemaName}</span></>
                  ) : (
                    'Suất chiếu có sẵn'
                  )}
                </p>
                <span className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">Bấm vào khung giờ để chọn</span>
              </div>

              {data?.rooms?.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {data.rooms.map(room => {
                    const minPrice = room.prices?.length
                      ? Math.min(...room.prices.filter(p => p.amount).map(p => Number(p.amount)))
                      : null;
                    return (
                      <div key={room.id} className="rounded-lg sm:rounded-xl border border-line overflow-hidden bg-surface/40">
                        {/* Room header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-surface border-b border-line gap-0.5 sm:gap-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-slate-200">
                            <span className="text-brand">{room.format || '2D'}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-300">{room.name || 'Phòng chiếu'}</span>
                          </div>
                          <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-400">
                            <span>Phòng chiếu: <strong className="text-slate-200">{room.name}</strong></span>
                            {minPrice && <span className="font-bold text-slate-200">{formatVND(minPrice)}</span>}
                          </div>
                        </div>

                        {/* Showtime slots */}
                        <div className="p-2.5 sm:p-4 flex flex-wrap gap-2 sm:gap-2.5">
                          {room.showtimes?.map(slot => {
                            const isSelected = selectedSlot?.slot?.id === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => handleSelectSlot(room, slot)}
                                disabled={slot.soldOut}
                                className={`relative flex flex-col items-center px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl border text-xs font-bold transition-all min-w-[72px] sm:min-w-[96px] cursor-pointer ${
                                  slot.soldOut
                                    ? 'bg-surface/30 border-line/40 text-slate-600 cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-brand border-brand text-white shadow-lg shadow-brand/30'
                                      : 'bg-surface border-line text-white hover:border-brand hover:bg-brand/10 hover:text-brand'
                                }`}
                              >
                                <span className="text-xs sm:text-base font-black">{formatTime(slot.startsAt)}</span>
                                <span className={`text-[9px] sm:text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                  ~ {formatTime(slot.movieEndsAt || slot.endsAt)}
                                </span>
                                {slot.soldOut ? (
                                  <span className="text-[9px] sm:text-[10px] text-red-500 mt-0.5 sm:mt-1 font-semibold">Hết vé ({slot.availableSeats})</span>
                                ) : (
                                  <span className={`text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 ${isSelected ? 'text-white/90' : 'text-emerald-400'}`}>
                                    Còn {slot.availableSeats} ghế
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-brand" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 sm:py-10 text-center text-slate-500">
                  <Film className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 opacity-30" />
                  <p className="text-xs sm:text-sm">Không có suất chiếu nào cho ngày này.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── CỘT PHẢI: Thông tin vé (Sidebar) ── */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 self-start lg:sticky lg:top-24">
            <div className="bg-card rounded-xl sm:rounded-2xl border border-line overflow-hidden shadow-xl sm:shadow-2xl shadow-black/60">
              {/* Header sidebar */}
              <div className="flex items-center gap-2 sm:gap-2.5 px-4 py-3 sm:px-5 sm:py-4 border-b border-line bg-surface/50">
                <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">Thông Tin Vé</span>
              </div>

              <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                {/* Movie minicard */}
                <div className="flex gap-3 sm:gap-3.5">
                  <div className="w-12 sm:w-16 aspect-[2/3] rounded-md sm:rounded-lg overflow-hidden border border-line shrink-0 shadow-md">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Film className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                      {movie.ageRating && <AgeBadge rating={movie.ageRating} size="sm" />}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">{movie.title}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">{formatDuration(movie.duration)}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500">Phụ đề tiếng Việt</p>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2 sm:space-y-2.5 border-t border-line pt-2.5 sm:pt-3 text-[11px] sm:text-xs">
                  {[
                    ['Rạp chiếu',  selectedSlot ? selectedCinemaName : (selectedCinemaName || <span className="text-slate-600 italic">Chưa chọn</span>)],
                    ['Ngày chiếu', selectedDate ? displayDate : <span className="text-slate-600 italic">Chưa chọn</span>],
                    ['Định dạng',  selectedSlot?.room?.format || movie.format || '2D'],
                    ['Phòng chiếu', selectedSlot ? selectedSlot.room.name : <span className="text-slate-600 italic">Chưa chọn</span>],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0 font-medium">{label}</span>
                      <span className="text-slate-200 font-semibold text-right">{value}</span>
                    </div>
                  ))}

                  {/* Suất chiếu highlight */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-line/60">
                    <span className="text-slate-400 shrink-0 font-semibold">Suất chiếu</span>
                    {selectedSlot ? (
                      <span className="text-brand font-black text-xs sm:text-sm">
                        {formatTime(selectedSlot.slot.startsAt)} – {formatTime(selectedSlot.slot.movieEndsAt || selectedSlot.slot.endsAt)}
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">Chưa chọn</span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedSlot}
                  className={`w-full py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                    selectedSlot
                      ? 'bg-gradient-to-r from-brand to-[#FF4D6D] hover:from-[#E61E43] hover:to-brand text-white shadow-lg shadow-brand/30 hover:scale-[1.02]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  TIẾP TỤC CHỌN GHẾ
                  {selectedSlot && <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>

                {!selectedSlot && (
                  <p className="text-center text-[10px] text-slate-500">Vui lòng chọn suất chiếu để tiếp tục</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   RELATED MOVIES (Có thể bạn cũng thích)
═══════════════════════════════════════ */
function RelatedMovies({ movieId }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;
    const ctrl = new AbortController();
    movieDetailApi.getRelatedMovies(movieId, 4, ctrl.signal)
      .then(setMovies).catch(() => setMovies([]))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [movieId]);

  if (loading || movies.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="w-1 sm:w-1.5 h-5 sm:h-6 rounded-full bg-brand shrink-0" />
          <h2 className="text-base sm:text-xl font-bold text-white tracking-wide">Có thể bạn cũng thích</h2>
        </div>
        <Link to="/phim" className="text-xs text-slate-400 hover:text-brand transition-colors flex items-center gap-1 hidden sm:flex font-medium">
          Khám phá thêm phim đang chiếu <ChevronRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
        {movies.map(m => {
          const status = getStatusInfo(m.screeningStatus);
          return (
            <Link
              key={m.id}
              to={`/phim/${m.id}`}
              className="group bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-line hover:border-brand/50 transition-all hover:shadow-xl hover:shadow-brand/10 flex flex-col"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
                {m.posterUrl ? (
                  <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Film className="w-8 h-8 text-slate-700" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">{m.ageRating && <AgeBadge rating={m.ageRating} size="sm" />}</div>
              </div>
              <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand transition-colors line-clamp-1 leading-tight">{m.title}</h3>
                <div className="flex flex-wrap gap-1 mt-auto">
                  <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
                </div>
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); alert('Chức năng đặt vé đang được phát triển. Vui lòng quay lại sau!'); }}
                  className="w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-brand to-[#FF4D6D] hover:from-[#E61E43] hover:to-brand transition-all mt-1 cursor-pointer"
                >
                  Mua vé
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile: Link xem thêm */}
      <div className="mt-3.5 flex justify-center sm:hidden">
        <Link to="/phim" className="text-xs text-slate-400 hover:text-brand transition-colors flex items-center gap-1 font-medium">
          Khám phá thêm phim đang chiếu <ChevronRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MOVIE DETAIL PAGE (Main export)
═══════════════════════════════════════ */
export default function MovieDetailPage() {
  const { movieId } = useParams();
  const [movie, setMovie]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('info');
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [galleryOpenIndex, setGalleryOpenIndex] = useState(null);

  const infoRef      = useRef(null);
  const trailerRef   = useRef(null);
  const showtimesRef = useRef(null);
  const relatedRef   = useRef(null);

  useEffect(() => {
    if (!movieId) return;
    const ctrl = new AbortController();
    setLoading(true); setError(''); setMovie(null);
    movieDetailApi.getMovieDetail(movieId, ctrl.signal)
      .then(data => { setMovie(data); setActiveTab('info'); })
      .catch(err => { if (!ctrl.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [movieId]);

  const scrollToTab = (tabId) => {
    setActiveTab(tabId);
    const refMap = { info: infoRef, trailer: trailerRef, showtimes: showtimesRef, related: relatedRef };
    const el = refMap[tabId]?.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleBookNow = () => {
    const el = showtimesRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveTab('showtimes');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 sm:gap-4 text-slate-400">
      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-brand" />
      <p className="text-xs sm:text-sm font-medium">Đang tải thông tin phim...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 sm:gap-5 px-4 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-white">Không thể tải thông tin phim</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm">{error}</p>
      </div>
      <Link
        to="/phim"
        className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand hover:bg-[#E61E43] transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Quay lại danh sách phim
      </Link>
    </div>
  );

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-page text-slate-100">
      {/* Trailer modal */}
      {trailerOpen && movie.trailerUrl && (
        <TrailerModal url={movie.trailerUrl} title={movie.title} onClose={() => setTrailerOpen(false)} />
      )}
      {galleryOpenIndex !== null && (
        <GalleryModal
          images={getGalleryImages(movie)}
          title={movie.title}
          activeIndex={galleryOpenIndex}
          onClose={() => setGalleryOpenIndex(null)}
          onChange={setGalleryOpenIndex}
        />
      )}

      {/* Hero */}
      <HeroSection movie={movie} onWatchTrailer={() => setTrailerOpen(true)} onBookNow={handleBookNow} />

      {/* Tab Nav */}
      <TabNav active={activeTab} onChange={scrollToTab} />

      {/* Page Body: Các section tuần tự cách nhau rõ ràng, co giãn mượt mà giữa mobile và laptop */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12 space-y-8 sm:space-y-12 md:space-y-16">
        {/* 1. Tổng quan */}
        <div ref={infoRef}>
          <InfoSection movie={movie} />
        </div>

        {/* 2. Trailer & Hình ảnh */}
        <div ref={trailerRef}>
          <TrailerSection
            movie={movie}
            onWatchTrailer={() => setTrailerOpen(true)}
            onViewImage={setGalleryOpenIndex}
          />
        </div>

        {/* 3. Lịch chiếu & Đặt vé */}
        <div ref={showtimesRef}>
          <ShowtimesSection movieId={Number(movieId)} movie={movie} />
        </div>

        {/* 4. Phim liên quan */}
        <div ref={relatedRef}>
          <RelatedMovies movieId={Number(movieId)} />
        </div>
      </div>
    </div>
  );
}

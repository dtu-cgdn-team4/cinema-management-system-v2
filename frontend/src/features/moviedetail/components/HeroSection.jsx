import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Calendar, Film, Ticket, Play, Bookmark } from 'lucide-react';
import AgeBadge from '@/components/common/AgeBadge';
import { formatDuration, formatDate, getStatusInfo } from '../utils/movieDetailFormatters';

export default function HeroSection({ movie, onWatchTrailer, onBookNow }) {
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

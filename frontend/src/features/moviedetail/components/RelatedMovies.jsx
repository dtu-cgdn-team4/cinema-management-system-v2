import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight as ChevronRightIcon, Film } from 'lucide-react';
import AgeBadge from '@/components/common/AgeBadge';
import { movieDetailApi } from '../api/movieDetailApi';
import { getStatusInfo } from '../utils/movieDetailFormatters';

export default function RelatedMovies({ movieId }) {
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

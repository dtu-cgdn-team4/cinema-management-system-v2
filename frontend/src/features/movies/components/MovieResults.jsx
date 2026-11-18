import { Link } from 'react-router-dom';
import { Loader2, Calendar, Clock, Film, RotateCcw } from 'lucide-react';
import MovieCard from '@/components/common/MovieCard';
import AgeBadge from '@/components/common/AgeBadge';

export default function MovieResults({ loading, error, displayMovies, viewMode, searchQuery, handleResetFilters }) {
  return (<>
      {loading && (
        <div className="flex items-center justify-center py-6 text-sm text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-brand" />
          <span>Đang tải danh sách phim...</span>
        </div>
      )}

      {error ? <p role="alert" className="py-8 text-center text-red-400">{error}</p> : loading ? null : displayMovies.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {displayMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="bg-[#131B2A] rounded-2xl border border-[#222E42] overflow-hidden shadow-xl">
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-[#101724] border-b border-[#222E42] text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div className="col-span-6">Phim</div>
              <div className="col-span-2 text-center">Khởi chiếu</div>
              <div className="col-span-2 text-center">Thời lượng</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>

            <div className="divide-y divide-[#1D273A]">
              {displayMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="p-4 sm:p-5 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center hover:bg-[#182235]/60 transition-colors"
                >

                  <div className="col-span-6 min-w-0 flex items-start gap-3 sm:gap-4">
                    <Link to={`/phim/${movie.id}`} className="relative w-16 sm:w-20 aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shadow-md">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <AgeBadge rating={movie.ageRating} size="sm" />
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            movie.status === 'NOW_SHOWING'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          }`}
                        >
                          {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white hover:text-brand transition-colors line-clamp-2 break-words">
                        {movie.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {movie.genre}
                      </p>

                      {movie.actors && movie.actors.length > 0 && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 hidden sm:block">
                          Diễn viên: {movie.actors.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 lg:mt-0 col-span-2 text-left lg:text-center text-xs text-slate-300 flex items-center lg:justify-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 lg:hidden" />
                    <span className="font-mono">
                      {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="mt-1 lg:mt-0 col-span-2 text-left lg:text-center text-xs text-slate-300 flex items-center lg:justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 lg:hidden" />
                    <span>{movie.duration} phút</span>
                  </div>

                  <div className="mt-4 lg:mt-0 col-span-2 grid grid-cols-1 gap-2 lg:flex lg:justify-end">
                    <Link
                      to={`/phim/${movie.id}`}
                      className="flex items-center justify-center min-h-11 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-brand to-[#FF4D6D] hover:from-[#E61E43] hover:to-brand shadow-md shadow-brand/20 transition-all hover:scale-105"
                    >
                      Đặt vé
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="px-4 py-10 sm:py-16 break-words text-center space-y-4 bg-[#111726]/60 rounded-2xl border border-[#1E293B]">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center">
            <Film className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              Không tìm thấy phim phù hợp
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Không có bộ phim nào khớp với từ khóa "{searchQuery}" hoặc tiêu chí bộ lọc đã chọn.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            type="button"
            className="inline-flex min-h-11 items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      )}

  </>);
}

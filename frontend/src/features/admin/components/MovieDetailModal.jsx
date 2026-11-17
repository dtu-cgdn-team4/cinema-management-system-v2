/**
 * Tên tệp: Hộp thoại xem chi tiết phim (MovieDetailModal.jsx)
 * Tên tệp tiếng Việt: Hộp thoại xem chi tiết phim
 * Chức năng: Cho phép quản trị viên xem nhanh toàn bộ thông số phim (áp phích,
 * mã phim, tên gốc, hãng phim, ngày chiếu, trailer, danh sách diễn viên và các khung giờ chiếu).
 */
import { useEffect } from 'react';
import { formatDate } from '../../../utils/format';
import {
  AGE_RATING_META,
  MOVIE_STATUS,
  MOVIE_STATUS_META,
} from '../api/mockMoviesData';

export default function MovieDetailModal({
  movie,
  isOpen,
  onClose,
  onRequestStopRelease,
}) {
  // Lắng nghe sự kiện phím Escape để đóng nhanh hộp thoại chi tiết
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  const statusMeta = MOVIE_STATUS_META[movie.status] ?? MOVIE_STATUS_META.DANG_CHIEU;
  const ageMeta = AGE_RATING_META[movie.ageRating] ?? {
    label: movie.ageRating,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const isStopped = movie.status === MOVIE_STATUS.NGUNG_CHIEU;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-detail-modal-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-rose-600">{movie.code}</span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMeta.badgeClass}`}
              >
                {statusMeta.label}
              </span>
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-bold ${ageMeta.badgeClass}`}
              >
                {ageMeta.label}
              </span>
            </div>
            <h2 id="movie-detail-modal-title" className="mt-1.5 text-xl font-bold text-slate-900">
              {movie.title}
            </h2>
            {(movie.originalTitle || movie.country) && (
              <p className="text-xs text-slate-500">
                {[movie.originalTitle, movie.country].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Content Layout */}
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Left Column: Poster & Quick specs */}
          <div className="sm:col-span-1">
            <img
              src={movie.posterUrl}
              alt={`Poster ${movie.title}`}
              className="w-full rounded-xl border border-slate-200 object-cover shadow-sm aspect-[2/3]"
            />
            <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Thời lượng:</span>
                <span className="font-semibold text-slate-800">{movie.duration} phút</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Định dạng:</span>
                <span className="font-semibold text-slate-800">{movie.formats.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Suất chiếu:</span>
                <span className="font-bold text-rose-600">{movie.totalShowtimes} suất</span>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="space-y-4 sm:col-span-2 text-xs leading-relaxed">
            <div>
              <p className="font-bold tracking-wider text-slate-400 uppercase text-[10px]">
                Thể loại
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Ngày khởi chiếu
                </p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {formatDate(movie.releaseDate)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Ngày kết thúc dự kiến
                </p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {movie.endDate ? formatDate(movie.endDate) : 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            {(movie.director || movie.studio) && (
              <div>
                <p className="font-bold tracking-wider text-slate-400 uppercase text-[10px]">
                  Đạo diễn & Hãng sản xuất
                </p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {[movie.director, movie.studio].filter(Boolean).join(' • ')}
                </p>
              </div>
            )}

            {movie.actors && (
              <div>
                <p className="font-bold tracking-wider text-slate-400 uppercase text-[10px]">
                  Diễn viên chính
                </p>
                <p className="mt-0.5 text-slate-700">{movie.actors}</p>
              </div>
            )}

            {movie.noi_dung && (
              <div>
                <p className="font-bold tracking-wider text-slate-400 uppercase text-[10px]">
                  Nội dung tóm tắt
                </p>
                <p className="mt-1 text-slate-600 leading-normal">{movie.noi_dung}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            {!isStopped ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestStopRelease(movie);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                <span>Ngừng phát hành phim này</span>
              </button>
            ) : (
              <span className="text-xs italic text-slate-400">
                Phim đã ở trạng thái Ngừng chiếu
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

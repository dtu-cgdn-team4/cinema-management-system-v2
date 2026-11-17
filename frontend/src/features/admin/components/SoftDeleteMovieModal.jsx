/**
 * Tên tệp: Hộp thoại xác nhận xóa mềm phim (SoftDeleteMovieModal.jsx)
 * Tên tệp tiếng Việt: Hộp thoại xác nhận ngừng phát hành phim
 * Chức năng: Hiển thị modal xác nhận ngừng chiếu bộ phim (Frame 2 - node 1308:13022 & 1568:981 trong Figma).
 * Đảm bảo thông điệp nghiệp vụ: không xóa vật lý khỏi cơ sở dữ liệu và bảo toàn toàn bộ lịch sử đặt vé.
 */
import { useEffect } from 'react';
import { formatDate } from '../../../utils/format';
import { MOVIE_STATUS_META } from '../api/mockMoviesData';

export default function SoftDeleteMovieModal({
  movie,
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  // Lắng nghe sự kiện phím Escape để đóng hộp thoại nhanh
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Nếu modal không mở hoặc không có dữ liệu phim thì không render
  if (!isOpen || !movie) return null;

  const statusMeta = MOVIE_STATUS_META[movie.status] ?? MOVIE_STATUS_META.DANG_CHIEU;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="soft-delete-modal-title"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-[460px] rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h2 id="soft-delete-modal-title" className="text-lg font-bold text-slate-900">
            Ngừng phát hành phim?
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng hộp thoại"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Subtitle */}
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Bạn có chắc chắn muốn ngừng chiếu bộ phim này? Phim sẽ chuyển sang trạng thái{' '}
          <span className="font-semibold text-slate-800">Ngừng chiếu</span> và không còn hiển thị
          để tạo suất chiếu mới hoặc đặt vé.
        </p>

        {/* Selected Movie Summary Card */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 4v16M17 4v16M2 8h5M17 8h5M2 12h20M2 16h5M17 16h5" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{movie.title}</p>
              <p className="truncate text-xs text-slate-500">
                {movie.code} • Khởi chiếu: {formatDate(movie.releaseDate)}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMeta.badgeClass}`}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* Khối cam kết bảo toàn dữ liệu (nghiệp vụ xóa mềm) */}
        <div className="mt-3.5 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-3.5">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-sky-950">Dữ liệu phim không bị xóa</p>
            <p className="mt-0.5 text-sky-800">
              Thông tin phim, suất chiếu đã tạo và lịch sử đặt vé vẫn được lưu giữ để tra cứu, báo
              cáo.
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Bạn có thể phát hành lại phim từ trang chỉnh sửa bất cứ lúc nào.
        </p>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(movie.id)}
            disabled={isSubmitting}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Ngừng phát hành'}
          </button>
        </div>
      </div>
    </div>
  );
}

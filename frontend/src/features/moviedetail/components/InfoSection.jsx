import { Users } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { formatDate, formatDuration } from '../utils/movieDetailFormatters';

export default function InfoSection({ movie }) {
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

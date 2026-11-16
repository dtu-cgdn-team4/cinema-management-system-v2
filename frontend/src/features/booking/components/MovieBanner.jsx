import { Play, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, fromDateKey } from '../../../utils/format';

const BUTTON =
  'flex items-center gap-1.5 rounded-xl border border-line bg-card px-4 py-2 text-xs whitespace-nowrap text-zinc-300 transition hover:border-white/20 hover:text-white';

/** Dải thông tin phim đang đặt vé (Figma "Phim đã chọn"); `backTo` là trang lịch chiếu để đổi phim. */
export default function MovieBanner({ movie, backTo }) {
  return (
    <section className="border-b border-line bg-linear-to-r from-surface via-page to-surface">
      <div className="mx-auto flex max-w-304 gap-6 px-4 py-6 xl:px-0">
        <div className="relative hidden h-48 w-32 shrink-0 overflow-hidden rounded-xl border border-line shadow-2xl sm:block">
          {movie.posterUrl && (
            <img src={movie.posterUrl} alt={`Poster ${movie.title}`} className="size-full object-cover" />
          )}
          <span className="absolute top-2 left-2 rounded bg-brand-dark px-1.5 py-0.5 text-[9px] leading-[13.5px] font-black">
            {movie.ageRating}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brand/25 bg-brand/10 px-2 py-0.5 text-[10px] leading-3.75 font-bold tracking-wider text-brand uppercase">
              Đang đặt vé cho phim
            </span>
            <span className="text-xs text-muted">• Khởi chiếu từ {formatDate(fromDateKey(movie.releaseDate))}</span>
          </div>
          <h1 className="font-display text-[30px] leading-9 font-bold tracking-tight uppercase">{movie.title}</h1>
          <p className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
            {movie.genres.length > 0 && (
              <>
                <span>{movie.genres.join(', ')}</span>
                <span className="text-zinc-600">•</span>
              </>
            )}
            <span>{movie.duration} phút</span>
          </p>
          {movie.description && (
            <p className="line-clamp-2 max-w-3xl text-xs leading-relaxed text-muted">{movie.description}</p>
          )}
        </div>

        <div className="hidden shrink-0 flex-col items-end justify-center gap-2.5 border-l border-line pl-6 md:flex">
          <Link to={backTo} className={BUTTON}>
            <RefreshCw size={14} className="text-muted" />
            Chọn phim khác
          </Link>
          {movie.trailerUrl && (
            <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className={BUTTON}>
              <Play size={14} className="fill-brand text-brand" />
              Xem Trailer
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

import { formatDate, formatTime, fromDateKey } from '../../../utils/format';

// Figma tô vàng khi còn 14 ghế, xanh khi còn 18 ghế
const LOW_SEATS = 15;

function ShowtimeButton({ showtime, onSelect }) {
  const seats = showtime.availableSeats;
  const tone = seats === 0 ? 'text-muted' : seats <= LOW_SEATS ? 'text-warn' : 'text-ok';
  return (
    <button
      type="button"
      disabled={seats === 0}
      onClick={() => onSelect(showtime.id)}
      className="flex w-29 flex-col gap-0.5 rounded-xl border border-line bg-card px-3.5 py-2.5 text-left transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
    >
      <span className="text-base leading-5 font-extrabold">{formatTime(showtime.startTime)}</span>
      <span className="text-[11px] leading-3.5 text-muted">đến {formatTime(showtime.endTime)}</span>
      <span className={`text-[10px] leading-3 font-medium ${tone}`}>
        {seats === 0 ? 'Hết ghế' : `Còn ${seats} ghế`}
      </span>
    </button>
  );
}

const badge = 'rounded-md border px-2 py-0.75 text-[10px] leading-3.25 font-bold tracking-[0.04em]';

/** Một phim trong lịch chiếu: poster, thông tin phim và các giờ chiếu tại rạp đã chọn. */
export default function MovieShowtimes({ movie, showtimes, onSelect }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-line bg-surface p-5 sm:gap-7">
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={`Poster ${movie.title}`}
          className="h-45 w-30 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="h-45 w-30 shrink-0 rounded-xl bg-card" />
      )}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <span className={`${badge} border-brand/35 bg-brand/15 text-brand`}>{movie.ageRating}</span>
            <span className={`${badge} border-ok/35 bg-ok/15 text-ok`}>Đang chiếu</span>
          </div>
          <h3 className="font-display text-xl leading-6.5 font-bold">{movie.title}</h3>
          <p className="text-xs leading-3.75 text-muted">
            {[movie.genres.join(', '), `${movie.duration} phút`, `Khởi chiếu ${formatDate(fromDateKey(movie.releaseDate))}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <p className="text-xs leading-3.75 font-bold text-info">2D</p>
          <div className="flex flex-wrap gap-2.5">
            {showtimes.map((showtime) => (
              <ShowtimeButton key={showtime.id} showtime={showtime} onSelect={onSelect} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

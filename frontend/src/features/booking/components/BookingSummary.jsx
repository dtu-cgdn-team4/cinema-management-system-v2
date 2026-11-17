import { ArrowRight, Ticket, X } from 'lucide-react';
import { formatDate, formatTime, formatVnd, toDateKey, weekdayName } from '../../../utils/format';
import { SEAT_TYPE_NAME } from '../utils/seatTypes';

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">{children}</dd>
    </div>
  );
}

/** Thẻ "Thông Tin Vé Đặt" bên phải sơ đồ ghế: phim, suất, ghế đang chọn, tổng tiền và nút Tiếp tục. */
export default function BookingSummary({ movie, showtime, prices, selected, onRemove, error, submitting, onSubmit }) {
  const day = toDateKey(showtime.startTime) === toDateKey(new Date()) ? 'Hôm nay' : weekdayName(showtime.startTime);
  // Lúc sơ đồ ghế chưa tải xong thì lấy giá từ lượt giữ ghế (ghế giữ có sẵn giá)
  const byType = Object.entries(SEAT_TYPE_NAME)
    .map(([type, name]) => {
      const seats = selected.filter((seat) => seat.type === type);
      return { type, name, count: seats.length, price: prices?.[type] ?? seats[0]?.price };
    })
    .filter((group) => group.count > 0);
  const total = byType.reduce((sum, group) => sum + group.count * (group.price ?? 0), 0);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-line bg-page p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="flex items-center gap-2 font-display text-base leading-6 font-bold">
          <Ticket size={16} strokeWidth={1.5} absoluteStrokeWidth className="text-brand" />
          Thông Tin Vé Đặt
        </h2>
        <span className="rounded border border-brand/30 bg-brand/15 px-2 py-0.5 text-[10px] leading-3.75 font-bold tracking-wider text-brand uppercase">
          Bước 2 / 3
        </span>
      </div>

      <div className="flex items-center gap-3.5">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt="" className="h-13 w-16 shrink-0 rounded-lg border border-line object-cover" />
        ) : (
          <div className="h-13 w-16 shrink-0 rounded-lg border border-line bg-card" />
        )}
        <div className="flex min-w-0 flex-col items-start gap-1.25">
          <span className="rounded bg-brand-dark px-1.5 text-[9px] leading-3.5 font-black">{movie.ageRating}</span>
          <p className="text-sm leading-5 font-bold">{movie.title}</p>
          <p className="text-xs text-muted">{movie.duration} phút</p>
        </div>
      </div>

      <dl className="flex flex-col gap-3 rounded-xl border border-line bg-page px-3.5 py-4 text-xs">
        <InfoRow label="Rạp chiếu:">{showtime.cinemaName}</InfoRow>
        <InfoRow label="Ngày chiếu:">
          {day} ({formatDate(showtime.startTime)})
        </InfoRow>
        <InfoRow label="Định dạng:">
          <span className="text-info">2D</span>
        </InfoRow>
        <InfoRow label="Phòng chiếu:">{showtime.room.name}</InfoRow>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-2">
          <dt className="text-muted">Suất chiếu:</dt>
          <dd className="text-base leading-6 font-black text-brand">
            {formatTime(showtime.startTime)} ~ {formatTime(showtime.endTime)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 text-xs">
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold">Ghế đã chọn</p>
          {selected.length > 0 && (
            <p className="text-muted">
              {selected.length} vé • {byType.map((group) => group.name).join(', ')}
            </p>
          )}
        </div>
        {selected.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {selected.map((seat) => (
              <li key={seat.id}>
                <button
                  type="button"
                  onClick={() => onRemove(seat)}
                  aria-label={`Bỏ chọn ghế ${seat.label}`}
                  className="flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/15 px-3 py-1.75 font-bold text-brand transition hover:bg-brand/25"
                >
                  {seat.label}
                  <X size={12} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Chưa chọn ghế nào.</p>
        )}
        {byType
          .filter((group) => group.price != null)
          .map((group) => (
            <div key={group.type} className="flex justify-between gap-3">
              <span className="text-muted">
                {group.count} × {formatVnd(group.price)}
              </span>
              <span className="font-semibold">{formatVnd(group.count * group.price)}</span>
            </div>
          ))}
      </div>

      <div className="flex flex-col gap-1.25 border-t border-line pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">Tổng cộng</span>
          <span className="text-2xl leading-8 font-black">{formatVnd(total)}</span>
        </div>
        <p className="text-right text-[10px] leading-3.75 text-muted">Đã bao gồm VAT</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand to-brand-dark text-xs font-bold tracking-wider uppercase shadow-[0_8px_15px_-3px_rgb(234_56_77/0.3)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? 'Đang giữ ghế…' : 'Tiếp tục'}
          {!submitting && <ArrowRight size={16} strokeWidth={1.5} absoluteStrokeWidth />}
        </button>
        <p className="text-center text-[11px] text-muted">Kiểm tra thông tin và thanh toán ở bước tiếp theo.</p>
      </div>
    </section>
  );
}

import { ArrowLeft, Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import spinner from '../../../assets/spinner.svg';
import { errorMessage } from '../../../services/apiClient';
import { subscribe } from '../../../services/socketClient';
import { formatVnd, toDateKey } from '../../../utils/format';
import { getSeatMap, holdSeats } from '../api/seatApi';
import BookingHeader from '../components/BookingHeader';
import BookingSummary from '../components/BookingSummary';
import HoldCountdown from '../components/HoldCountdown';
import MovieBanner from '../components/MovieBanner';
import SeatBox from '../components/SeatBox';
import SeatMap from '../components/SeatMap';
import { clearHold, loadHold, saveHold } from '../utils/heldSeats';
import { SEAT_TYPE_NAME } from '../utils/seatTypes';

const AGE_NOTE = {
  P: 'Phim dành cho mọi lứa tuổi.',
  K: 'Phim dành cho khán giả dưới 13 tuổi, có người bảo hộ đi kèm.',
  T13: 'Phim dành cho khán giả từ đủ 13 tuổi trở lên.',
  T16: 'Phim dành cho khán giả từ đủ 16 tuổi trở lên.',
  T18: 'Phim dành cho khán giả từ đủ 18 tuổi trở lên.',
};

const LEGEND = [
  ['Ghế trống', 'border-muted bg-card'],
  ['Đã đặt', 'border-[#22242e] bg-[#22242e]'],
  ['Đang chọn', 'border-brand bg-brand'],
];

/**
 * SRS 6.2.2 Đặt vé – Chọn ghế, giao diện theo frame "Trang chọn ghế" của Figma.
 * Sơ đồ lấy qua REST rồi cập nhật qua WebSocket (architecture.md, luồng đặt vé bước 1 và 4).
 * Bấm thẳng vào ghế, tối đa maxSeats ghế mỗi lần (business-rules); bấm Tiếp tục thì giữ ghế 10 phút ở server.
 */
export default function SeatSelectionPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  // { movie, showtime } từ trang lịch chiếu để hiện thông tin phim ngay trong lúc tải sơ đồ ghế
  const { state: preview } = useLocation();

  const [seatMap, setSeatMap] = useState(null);
  const [takenIds, setTakenIds] = useState(() => new Set());
  const [loadError, setLoadError] = useState(null);
  // Quay lại từ bước thanh toán: ghế mình đang giữ hiện là ghế đang chọn, kèm thời gian còn lại
  const [hold, setHold] = useState(() => loadHold(showtimeId));
  const [selected, setSelected] = useState(hold?.seats ?? []);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    () =>
      getSeatMap(showtimeId).then(
        (map) => {
          setSeatMap(map);
          const seats = map.rows.flatMap((row) => row.seats);
          setTakenIds(new Set(seats.filter((seat) => seat.status === 'TAKEN').map((seat) => seat.id)));
        },
        (err) => setLoadError(errorMessage(err)),
      ),
    [showtimeId],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Tin WebSocket mang toàn bộ ghế đang giữ hoặc đã bán của suất
  useEffect(
    () =>
      subscribe(`/topic/showtimes/${showtimeId}/seats`, (message) => setTakenIds(new Set(message.takenSeatIds)), {
        onReconnect: load,
      }),
    [showtimeId, load],
  );

  const mineIds = useMemo(() => new Set(hold?.seats.map((seat) => seat.id)), [hold]);
  const selectedIds = useMemo(() => new Set(selected.map((seat) => seat.id)), [selected]);
  const isTaken = (seat) => takenIds.has(seat.id) && !mineIds.has(seat.id);

  // Ghế đang chọn vừa bị người khác giữ thì bỏ khỏi lựa chọn và báo cho khách
  useEffect(() => {
    if (submitting) return;
    const lost = selected.filter((seat) => takenIds.has(seat.id) && !mineIds.has(seat.id));
    if (lost.length === 0) return;
    setSelected((prev) => prev.filter((seat) => !lost.includes(seat)));
    setError(`Ghế ${lost.map((seat) => seat.label).join(', ')} vừa có người chọn, vui lòng chọn ghế khác`);
    // Chỉ xét lại khi trạng thái ghế đổi; selected, mineIds đọc ở lần render hiện tại
  }, [takenIds]);

  // business-rules: hết 10 phút thì báo lỗi, nhả ghế, khách chọn lại ở bước này
  const onHoldExpired = useCallback(() => {
    clearHold();
    setHold(null);
    setSelected([]);
    setError('Hết thời gian giữ ghế');
    load();
  }, [load]);

  const toggle = (seat) => {
    setError(null);
    if (selectedIds.has(seat.id)) {
      setSelected((prev) => prev.filter((s) => s.id !== seat.id));
      return;
    }
    if (selected.length >= seatMap.maxSeats) {
      setError(`Mỗi lần đặt tối đa ${seatMap.maxSeats} ghế`);
      return;
    }
    setSelected((prev) => [...prev, seat]);
  };

  const movie = seatMap?.movie ?? preview?.movie;
  const showtime = seatMap?.showtime ?? preview?.showtime;
  const backTo = showtime
    ? `/lich-chieu?cinemaId=${showtime.cinemaId}&date=${toDateKey(showtime.startTime)}`
    : '/lich-chieu';

  const submit = async () => {
    if (selected.length === 0) {
      setError('Vui lòng chọn ghế');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await holdSeats(showtimeId, { quantity: selected.length, seatIds: selected.map((seat) => seat.id) });
      saveHold(result);
      navigate(`/dat-ve/suat-chieu/${showtimeId}/thanh-toan`, { state: { hold: result, movie, showtime } });
    } catch (err) {
      setSubmitting(false);
      const status = err?.response?.status;
      // ponytail: chưa có trang đăng nhập; khi có thì chuyển tới /dang-nhap rồi quay lại trang này
      setError(status === 401 ? 'Vui lòng đăng nhập để giữ ghế.' : errorMessage(err));
      if (status === 409) load();
    }
  };

  const prices = seatMap?.prices;
  const priceTypes = prices ? Object.entries(SEAT_TYPE_NAME).filter(([type]) => prices[type] != null) : [];

  return (
    <div className="min-h-screen">
      <BookingHeader step={2} />
      {movie && <MovieBanner movie={movie} backTo={backTo} />}

      <main className="mx-auto flex max-w-304 flex-col gap-8 px-4 pt-8 pb-16 lg:flex-row lg:items-start xl:px-0">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Link to={backTo} className="flex items-center gap-1.75 self-start text-xs text-muted transition hover:text-white">
            <ArrowLeft size={14} strokeWidth={1.5} absoluteStrokeWidth />
            Quay lại chọn suất chiếu
          </Link>

          <section className="flex flex-col gap-4.5 rounded-2xl border border-line bg-page p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="flex items-center gap-2 font-display text-base leading-6 font-bold uppercase">
                  <span className="size-2 rounded-full bg-brand" />
                  Chọn ghế của bạn
                </h2>
                <p className="text-xs text-muted">
                  Chạm vào ghế trống để chọn hoặc bỏ chọn{seatMap && `, tối đa ${seatMap.maxSeats} ghế`}.
                </p>
              </div>
              {showtime && (
                <div className="flex shrink-0 flex-col items-end gap-1.25 text-xs whitespace-nowrap">
                  <span className="font-bold text-info">2D</span>
                  <span className="text-muted">{showtime.room.name}</span>
                </div>
              )}
            </div>

            {seatMap ? (
              <SeatMap rows={seatMap.rows} isTaken={isTaken} selectedIds={selectedIds} onToggle={toggle} />
            ) : (
              <div className="flex min-h-122.25 flex-col items-center justify-center gap-3.5 text-center">
                {loadError ? (
                  <>
                    <p role="alert" className="text-sm font-semibold text-red-300">
                      {loadError}
                    </p>
                    <Link to={backTo} className="text-xs text-white underline">
                      Chọn suất chiếu khác
                    </Link>
                  </>
                ) : (
                  <>
                    <img src={spinner} alt="" className="animate-spin" />
                    <p className="text-sm font-semibold">Đang tải sơ đồ ghế…</p>
                    <p className="text-xs text-muted">Trạng thái ghế được cập nhật theo thời gian thực.</p>
                  </>
                )}
              </div>
            )}

            <ul className="flex flex-wrap justify-center gap-7 border-t border-line pt-3.5 text-xs text-muted">
              {LEGEND.map(([label, swatch]) => (
                <li key={label} className="flex items-center gap-2">
                  <span className={`h-4 w-4.5 rounded-[3px] border ${swatch}`} />
                  {label}
                </li>
              ))}
            </ul>
          </section>

          {priceTypes.length > 0 && (
            <div className="flex flex-wrap gap-5 rounded-xl border border-line bg-page p-4.5">
              {priceTypes.map(([type, name]) => (
                <div key={type} className="flex items-center gap-2.5 sm:w-60.25">
                  <SeatBox variant={type}>{type === 'VIP' ? 'VIP' : '01'}</SeatBox>
                  <div className="flex flex-col gap-0.75">
                    <span className="text-xs font-bold">{name}</span>
                    <span className="text-[11px] text-muted">{formatVnd(prices[type])} / ghế</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {seatMap && (
            <p className="flex items-center gap-2 px-1 text-[11px] text-muted">
              <Info size={14} strokeWidth={1.4} absoluteStrokeWidth className="shrink-0" />
              Vui lòng không để trống 1 ghế giữa các ghế đã chọn. Mỗi lần đặt tối đa {seatMap.maxSeats} ghế.
            </p>
          )}
        </div>

        {movie && showtime && (
          <div className="flex flex-col gap-4 lg:w-96 lg:shrink-0">
            <BookingSummary
              movie={movie}
              showtime={showtime}
              prices={prices}
              selected={selected}
              onRemove={toggle}
              error={error}
              submitting={submitting}
              onSubmit={submit}
            />
            {hold && <HoldCountdown expiresAt={hold.expiresAt} onExpire={onHoldExpired} />}
            <p className="text-center text-[11px] text-zinc-500">
              {movie.ageRating} • {AGE_NOTE[movie.ageRating]}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

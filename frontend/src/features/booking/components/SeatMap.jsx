import screenArc from '../../../assets/screen-arc.svg';
import screenLight from '../../../assets/screen-light.svg';
import SeatBox from './SeatBox';

const SEAT_WIDTH = '38px';
// Lối đi rộng 26px như Figma: cột trống 10px cộng hai khoảng cách 8px
const AISLE_WIDTH = '10px';

/**
 * Màn chiếu và các hàng ghế. `rows` từ API sơ đồ ghế; `column` là vị trí trên lưới, cột không có ghế là lối đi.
 * Tên hàng lấy từ dữ liệu (business-rules: thiết kế nhảy từ H sang J).
 */
export default function SeatMap({ rows, isTaken, selectedIds, onToggle }) {
  const columns = new Set(rows.flatMap((row) => row.seats.map((seat) => seat.column)));
  const template = Array.from({ length: Math.max(...columns) }, (_, i) =>
    columns.has(i + 1) ? SEAT_WIDTH : AISLE_WIDTH,
  ).join(' ');

  return (
    <div className="overflow-x-auto">
      <div className="mx-auto flex w-max flex-col items-center gap-4">
        <div className="relative h-16.5 w-145">
          <img src={screenLight} alt="" className="absolute top-0 left-0" />
          <img src={screenArc} alt="" className="absolute top-[1.5px] left-[28.5px]" />
          <p className="absolute inset-x-0 top-7 text-center text-[10px] leading-3.75 text-muted">MÀN HÌNH</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <div key={row.name} className="flex items-center gap-5">
              <span className="w-5 text-center text-xs font-bold text-muted">{row.name}</span>
              <div className="grid gap-2" style={{ gridTemplateColumns: template }}>
                {row.seats.map((seat) => {
                  const taken = isTaken(seat);
                  const selected = selectedIds.has(seat.id);
                  return (
                    <SeatBox
                      key={seat.id}
                      as="button"
                      type="button"
                      variant={taken ? 'TAKEN' : selected ? 'SELECTED' : seat.type}
                      disabled={taken}
                      onClick={() => onToggle(seat)}
                      aria-pressed={selected}
                      aria-label={`Ghế ${seat.label}${seat.type === 'VIP' ? ' VIP' : ''}${taken ? ', đã đặt' : ''}`}
                      style={{ gridColumn: seat.column }}
                      className="enabled:cursor-pointer enabled:hover:brightness-125 disabled:cursor-not-allowed"
                    >
                      {String(seat.number).padStart(2, '0')}
                    </SeatBox>
                  );
                })}
              </div>
              <span className="w-5 text-center text-xs font-bold text-muted">{row.name}</span>
            </div>
          ))}
        </div>

        <div className="flex w-full justify-between text-[10px] leading-3.75 text-zinc-500">
          <span>← LỐI RA</span>
          <span>LỐI RA →</span>
        </div>
      </div>
    </div>
  );
}

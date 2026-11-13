import { CalendarDays } from 'lucide-react';
import { fromDateKey, weekdayName } from '../../../utils/format';

/** Thẻ "Chọn ngày xem phim"; `days` là các khóa "YYYY-MM-DD", ngày đầu là hôm nay. */
export default function DateTabs({ days, value, onChange }) {
  const selected = fromDateKey(value);
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4.75">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm leading-5 font-bold">Chọn ngày xem phim</h2>
        <span className="flex items-center gap-1.75 text-xs text-muted">
          <CalendarDays size={15} strokeWidth={1.6} absoluteStrokeWidth />
          Tháng {selected.getMonth() + 1} / {selected.getFullYear()}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 md:grid-cols-6">
        {days.map((key, i) => {
          const day = fromDateKey(key);
          const active = key === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1.75 rounded-xl border py-2.75 transition ${
                active ? 'border-brand bg-brand' : 'border-line bg-card text-muted hover:border-white/20'
              }`}
            >
              <span className="text-[11px] leading-4 font-bold tracking-[0.05em] uppercase">
                {i === 0 ? 'Hôm nay' : weekdayName(day)}
              </span>
              <span className="text-base leading-6 font-extrabold text-white">
                {String(day.getDate()).padStart(2, '0')}
              </span>
              <span className="text-[11px] leading-4">Tháng {day.getMonth() + 1}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

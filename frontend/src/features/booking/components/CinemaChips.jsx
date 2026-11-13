import { Link } from 'react-router-dom';

/** Chọn rạp: mỗi rạp một chip, rạp đang chọn viền đỏ (Figma "Lịch chiếu – Đang tải"). */
export default function CinemaChips({ cinemas, value, onChange }) {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[13px] leading-4 font-bold">Rạp chiếu</h2>
        <Link to="/rap-chieu" className="text-xs font-semibold text-brand hover:underline">
          Xem tất cả rạp →
        </Link>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {cinemas.map((cinema) => {
          const active = cinema.id === value;
          return (
            <button
              key={cinema.id}
              type="button"
              onClick={() => onChange(cinema.id)}
              aria-pressed={active}
              className={`rounded-xl border px-4 py-2.5 text-[13px] leading-4 transition ${
                active
                  ? 'border-brand bg-brand/15 font-semibold'
                  : 'border-line bg-card text-zinc-300 hover:border-white/20'
              }`}
            >
              {cinema.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

import { CircleCheck, Clock, MapPin, Navigation, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Thông tin rạp đang chọn (Figma "Chọn rạp chiếu", khối "Thông tin rạp đang chọn"). */
export default function CinemaDetail({ cinema }) {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cinema.address)}`;
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative h-62 bg-card">
        {cinema.imageUrl && <img src={cinema.imageUrl} alt="" className="size-full object-cover" />}
        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/30 to-transparent" />
        {/* Figma vẽ viền bên trong khung nên vị trí trừ 1px viền ngoài */}
        <span className="absolute top-4.75 left-4.75 flex items-center gap-2 rounded-full border border-brand/30 bg-surface px-2.75 py-1.25 text-xs leading-4.5 font-medium">
          <CircleCheck size={14} className="text-brand" />
          Rạp đang chọn
        </span>
        <p className="absolute bottom-5 left-5.75 font-display text-xl leading-7 font-bold">Mọi cảm xúc. Một màn ảnh.</p>
      </div>

      <div className="flex flex-col gap-5 px-5.75 pt-6 pb-5.75">
        <div className="border-b border-line pb-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-[26px] leading-7 font-bold">{cinema.name}</h2>
            <span className="rounded-md bg-card px-2.5 py-1.5 text-[11px] leading-3.75 font-bold text-zinc-300">2D</span>
          </div>
          <p className="mt-4 flex gap-2 text-sm text-muted">
            <MapPin size={18} className="shrink-0 text-brand" />
            {cinema.address}
          </p>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 text-xs leading-5 text-zinc-300">
            <Clock size={16} className="text-muted" />
            {cinema.openTime.slice(0, 5)} - {cinema.closeTime.slice(0, 5)} hằng ngày
            <span className="text-muted">·</span>
            <span className="text-muted">{cinema.roomCount} phòng chiếu</span>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to={`/lich-chieu?cinemaId=${cinema.id}`}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold transition hover:brightness-110"
          >
            <Ticket size={20} />
            Xem lịch chiếu
          </Link>
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-card text-sm font-semibold transition hover:border-white/20"
          >
            <Navigation size={20} />
            Xem đường đi
          </a>
        </div>

        <p className="text-center text-[11px] leading-4 text-muted">Lịch chiếu và định dạng phim được cập nhật hằng ngày.</p>
      </div>
    </section>
  );
}

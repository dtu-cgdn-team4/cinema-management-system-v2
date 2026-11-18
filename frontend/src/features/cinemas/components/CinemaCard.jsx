import { Check, MapPin } from 'lucide-react';

/** Một rạp trong danh sách (Figma "Chọn rạp chiếu", khối "Rạp chiếu"); rạp đang chọn viền đỏ, có dấu tích. */
export default function CinemaCard({ cinema, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full flex-col rounded-xl border p-4.75 text-left transition ${
        selected ? 'border-brand bg-brand/10' : 'border-line bg-surface hover:border-white/20'
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="font-display text-lg leading-6 font-bold">{cinema.name}</span>
        {selected ? (
          <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-brand">
            <Check size={14} strokeWidth={3} />
          </span>
        ) : (
          <span className="size-5.5 shrink-0 rounded-full border-2 border-white/10" />
        )}
      </span>
      <span className="mt-3 flex gap-2 text-xs leading-4 text-muted">
        <MapPin size={16} className="shrink-0" />
        {cinema.address}
      </span>
      <span className="mt-2.75 flex items-center justify-between text-xs leading-4">
        <span className="text-zinc-300">2D</span>
        <span className={selected ? 'font-medium text-brand' : 'text-muted'}>
          {selected ? 'Đang chọn' : 'Chọn rạp'}
        </span>
      </span>
    </button>
  );
}

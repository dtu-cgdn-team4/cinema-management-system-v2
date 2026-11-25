import { ArrowRight, Film, Ticket } from 'lucide-react';
import AgeBadge from '@/components/common/AgeBadge';
import { formatDuration, formatTime } from '../../utils/movieDetailFormatters';

export default function BookingSummary({ movie, selectedSlot, selectedCinemaName, selectedDate, displayDate, onContinue }) {
  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 self-start lg:sticky lg:top-24">
      <div className="bg-card rounded-xl sm:rounded-2xl border border-line overflow-hidden shadow-xl sm:shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 sm:gap-2.5 px-4 py-3 sm:px-5 sm:py-4 border-b border-line bg-surface/50">
          <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">Thông Tin Vé</span>
        </div>
        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex gap-3 sm:gap-3.5">
            <div className="w-12 sm:w-16 aspect-[2/3] rounded-md sm:rounded-lg overflow-hidden border border-line shrink-0 shadow-md">
              {movie.posterUrl ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Film className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">{movie.ageRating && <AgeBadge rating={movie.ageRating} size="sm" />}</div>
              <p className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">{movie.title}</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">{formatDuration(movie.duration)}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500">Phụ đề tiếng Việt</p>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-2.5 border-t border-line pt-2.5 sm:pt-3 text-[11px] sm:text-xs">
            {[
              ['Rạp chiếu', selectedCinemaName || <span className="text-slate-600 italic">Chưa chọn</span>],
              ['Ngày chiếu', selectedDate ? displayDate : <span className="text-slate-600 italic">Chưa chọn</span>],
              ['Định dạng', selectedSlot?.room?.format || movie.format || '2D'],
              ['Phòng chiếu', selectedSlot ? selectedSlot.room.name : <span className="text-slate-600 italic">Chưa chọn</span>],
            ].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-2"><span className="text-slate-500 shrink-0 font-medium">{label}</span><span className="text-slate-200 font-semibold text-right">{value}</span></div>)}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-line/60">
              <span className="text-slate-400 shrink-0 font-semibold">Suất chiếu</span>
              {selectedSlot ? <span className="text-brand font-black text-xs sm:text-sm">{formatTime(selectedSlot.slot.startsAt)} – {formatTime(selectedSlot.slot.movieEndsAt || selectedSlot.slot.endsAt)}</span> : <span className="text-slate-600 italic">Chưa chọn</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={onContinue}
            disabled={!selectedSlot}
            className={`w-full py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${selectedSlot ? 'bg-gradient-to-r from-brand to-[#FF4D6D] hover:from-[#E61E43] hover:to-brand text-white shadow-lg shadow-brand/30 hover:scale-[1.02]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
          >
            TIẾP TỤC CHỌN GHẾ {selectedSlot && <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          {!selectedSlot && <p className="text-center text-[10px] text-slate-500">Vui lòng chọn suất chiếu để tiếp tục</p>}
        </div>
      </div>
    </aside>
  );
}

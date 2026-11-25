import { Calendar } from 'lucide-react';
import { getDayLabel } from '../../utils/movieDetailFormatters';

export default function ShowtimeDatePicker({ dates, selectedDate, onSelectDate }) {
  const selected = new Date(`${selectedDate}T00:00:00`);

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl border border-line p-3.5 sm:p-5 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <p className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shrink-0">1</span>
          Chọn ngày xem phim
        </p>
        <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1 sm:gap-1.5 font-medium">
          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand" />
          Tháng {selected.getMonth() + 1}/{selected.getFullYear()}
        </span>
      </div>
      <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {dates.map((date) => {
          const dateObj = new Date(`${date}T00:00:00`);
          const isSelected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg sm:rounded-xl border text-xs font-bold shrink-0 min-w-[56px] sm:min-w-[74px] transition-all cursor-pointer ${isSelected ? 'bg-brand border-brand text-white shadow-lg shadow-brand/30' : 'bg-surface border-line text-slate-300 hover:border-brand/40 hover:text-white'}`}
            >
              <span className="text-[9px] sm:text-[10px] font-semibold mb-0.5">{getDayLabel(date)}</span>
              <span className="text-lg sm:text-2xl font-black leading-tight my-0.5">{dateObj.getDate()}</span>
              <span className="text-[9px] sm:text-[10px] opacity-75">Tháng {dateObj.getMonth() + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

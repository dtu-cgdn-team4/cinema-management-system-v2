import { Film } from 'lucide-react';
import { formatTime, formatVND } from '../../utils/movieDetailFormatters';

export default function RoomShowtimes({ rooms, selectedCinemaName, selectedSlot, onSelectSlot }) {
  return (
    <div className="bg-card rounded-xl sm:rounded-2xl border border-line p-3.5 sm:p-5 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <p className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shrink-0">3</span>
          {selectedCinemaName ? <>Suất chiếu tại <span className="text-brand normal-case font-bold ml-1">{selectedCinemaName}</span></> : 'Suất chiếu có sẵn'}
        </p>
        <span className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">Bấm vào khung giờ để chọn</span>
      </div>
      {rooms.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {rooms.map((room) => {
            const prices = room.prices?.filter((price) => price.amount).map((price) => Number(price.amount)) || [];
            const minPrice = prices.length ? Math.min(...prices) : null;
            return (
              <div key={room.id} className="rounded-lg sm:rounded-xl border border-line overflow-hidden bg-surface/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-surface border-b border-line gap-0.5 sm:gap-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-slate-200">
                    <span className="text-brand">{room.format || '2D'}</span><span className="text-slate-600">•</span><span className="text-slate-300">{room.name || 'Phòng chiếu'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-400">
                    <span>Phòng chiếu: <strong className="text-slate-200">{room.name}</strong></span>
                    {minPrice && <span className="font-bold text-slate-200">{formatVND(minPrice)}</span>}
                  </div>
                </div>
                <div className="p-2.5 sm:p-4 flex flex-wrap gap-2 sm:gap-2.5">
                  {room.showtimes?.map((slot) => {
                    const isSelected = selectedSlot?.slot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => onSelectSlot(room, slot)}
                        disabled={slot.soldOut}
                        className={`relative flex flex-col items-center px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl border text-xs font-bold transition-all min-w-[72px] sm:min-w-[96px] cursor-pointer ${slot.soldOut ? 'bg-surface/30 border-line/40 text-slate-600 cursor-not-allowed' : isSelected ? 'bg-brand border-brand text-white shadow-lg shadow-brand/30' : 'bg-surface border-line text-white hover:border-brand hover:bg-brand/10 hover:text-brand'}`}
                      >
                        <span className="text-xs sm:text-base font-black">{formatTime(slot.startsAt)}</span>
                        <span className={`text-[9px] sm:text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>~ {formatTime(slot.movieEndsAt || slot.endsAt)}</span>
                        {slot.soldOut ? (
                          <span className="text-[9px] sm:text-[10px] text-red-500 mt-0.5 sm:mt-1 font-semibold">Hết vé ({slot.availableSeats})</span>
                        ) : (
                          <span className={`text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 ${isSelected ? 'text-white/90' : 'text-emerald-400'}`}>Còn {slot.availableSeats} ghế</span>
                        )}
                        {isSelected && <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full flex items-center justify-center"><svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-brand" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 sm:py-10 text-center text-slate-500">
          <Film className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 opacity-30" />
          <p className="text-xs sm:text-sm">Không có suất chiếu nào cho ngày này.</p>
        </div>
      )}
    </div>
  );
}

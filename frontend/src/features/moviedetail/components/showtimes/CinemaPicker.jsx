import { MapPin } from 'lucide-react';

export default function CinemaPicker({ data, cinemas, selectedCity, selectedCinemaId, onCityChange, onCinemaSelect }) {
  return (
    <div className="bg-card rounded-xl sm:rounded-2xl border border-line p-3.5 sm:p-5 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 flex-wrap">
        <p className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shrink-0">2</span>
          Chọn vị trí &amp; cụm rạp
        </p>
        {data?.cities?.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Khu vực:</span>
            <select
              value={selectedCity}
              onChange={(event) => onCityChange(event.target.value)}
              className="bg-surface border border-line rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold text-white appearance-none cursor-pointer hover:border-brand/50 transition-colors focus:outline-none focus:border-brand pr-6 sm:pr-7"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ea384d' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.4rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.1em 1.1em',
              }}
            >
              {data.cities.map((city) => {
                const count = data.cinemas?.filter((cinema) => cinema.city === city).length || data.cinemas?.length || 0;
                return <option key={city} value={city} className="bg-slate-900 text-white">{city} ({count} rạp)</option>;
              })}
            </select>
          </div>
        )}
      </div>
      {cinemas.length > 0 ? (
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {cinemas.map((cinema, index) => {
            const isSelected = selectedCinemaId === cinema.id || (!selectedCinemaId && index === 0);
            return (
              <button
                key={cinema.id}
                type="button"
                onClick={() => onCinemaSelect(cinema.id)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border transition-all cursor-pointer ${isSelected ? 'bg-brand border-brand text-white shadow-md shadow-brand/25' : 'bg-surface border-line text-slate-300 hover:border-brand/40 hover:text-white'}`}
              >
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand shrink-0" />
                {cinema.name}
              </button>
            );
          })}
        </div>
      ) : <p className="text-[11px] sm:text-xs text-slate-500 py-1">Không có rạp nào tại khu vực này.</p>}
    </div>
  );
}

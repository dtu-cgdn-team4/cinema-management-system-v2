const TABS = [
  { id: 'info',      label: 'Tổng quan' },
  { id: 'trailer',  label: 'Trailer & Hình ảnh' },
  { id: 'showtimes',label: 'Lịch chiếu' },
  { id: 'related',  label: 'Phim liên quan' },
];
export default function TabNav({ active, onChange }) {
  return (
    <div className="border-b border-line sticky top-0 z-30 bg-page/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                active === tab.id
                  ? 'border-brand text-white'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   INFO SECTION (Tổng quan)
═══════════════════════════════════════ */

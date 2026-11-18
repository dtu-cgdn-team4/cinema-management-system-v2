import { Search, X } from 'lucide-react';
import MovieFilterSelect from './MovieFilterSelect';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Mặc định' },
  { value: 'release_desc', label: 'Khởi chiếu mới nhất' },
  { value: 'duration_asc', label: 'Thời lượng tăng dần' },
  { value: 'duration_desc', label: 'Thời lượng giảm dần' },
];


export default function MovieFilters({ searchInputRef, searchQuery, handleSearchChange, activeTab, handleTabChange, countAll, countNowShowing, countComingSoon, selectedGenre, handleGenreChange, availableGenres, sortBy, handleSortChange }) {
  return (
      <div className="bg-[#0E1524] p-3 sm:p-6 rounded-2xl border border-[#1F2B3E] shadow-xl space-y-5">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            aria-label="Tìm kiếm phim" ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo tên phim, đạo diễn hoặc diễn viên..."
            className="w-full bg-[#131B2A] text-base text-white placeholder-slate-400 pl-12 pr-10 py-3.5 rounded-xl border border-[#222E42] focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-2 border-t border-[#1D273A]">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <button
              onClick={() => handleTabChange('ALL')}
              type="button"
              className={`flex min-h-11 items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-brand text-white shadow-md shadow-brand/30'
                  : 'bg-[#151D2E] text-slate-300 hover:text-white border border-[#222E42] hover:bg-slate-800'
              }`}
            >
              <span>Tất cả</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {countAll}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('NOW_SHOWING')}
              type="button"
              className={`flex min-h-11 items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'NOW_SHOWING'
                  ? 'bg-brand text-white shadow-md shadow-brand/30'
                  : 'bg-[#151D2E] text-slate-300 hover:text-white border border-[#222E42] hover:bg-slate-800'
              }`}
            >
              <span>Phim đang chiếu</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'NOW_SHOWING' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {countNowShowing}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('COMING_SOON')}
              type="button"
              className={`flex min-h-11 items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'COMING_SOON'
                  ? 'bg-brand text-white shadow-md shadow-brand/30'
                  : 'bg-[#151D2E] text-slate-300 hover:text-white border border-[#222E42] hover:bg-slate-800'
              }`}
            >
              <span>Phim sắp chiếu</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'COMING_SOON' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {countComingSoon}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 xl:min-w-90">
            <MovieFilterSelect 
              label="Thể loại phim" 
              value={selectedGenre}
              onChange={handleGenreChange}
              options={availableGenres.map((genre) => ({ value: genre, label: genre }))} 
            />

            <MovieFilterSelect 
              label="Sắp xếp phim" 
              value={sortBy}
              onChange={handleSortChange} 
              options={SORT_OPTIONS} 
            />
          </div>
        </div>
      </div>

  );
}

import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, LayoutGrid, List, HelpCircle } from 'lucide-react';
import { errorMessage } from '@/services/apiClient';
import { movieApi } from '../api/movieApi';
import { mockGenres, searchMockMovies, shouldUseMockMovies } from '../api/mockMovies';
import MovieFilters from '../components/MovieFilters';
import MovieResults from '../components/MovieResults';

const GENRE_OPTIONS = ['Tất cả thể loại'];

export default function MovieListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  const queryQ = searchParams.get('q') || '';
  const queryStatus = searchParams.get('status') || 'ALL';
  const queryGenre = searchParams.get('genre') || 'Tất cả thể loại';
  const querySort = searchParams.get('sort') || 'recommended';

  const [searchQuery, setSearchQuery] = useState(queryQ);
  const [activeTab, setActiveTab] = useState(queryStatus);
  const [selectedGenre, setSelectedGenre] = useState(queryGenre);
  const [sortBy, setSortBy] = useState(querySort);
  const [viewMode, setViewMode] = useState('grid');

  const [apiMovies, setApiMovies] = useState([]);
  const [availableGenres, setAvailableGenres] = useState(GENRE_OPTIONS); //
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const genreOptions = usingMock ? [...GENRE_OPTIONS, ...mockGenres] : availableGenres;

  useEffect(() => {
    if (searchParams.get('focus') === 'search') {
      searchInputRef.current?.focus();
    }
  }, [searchParams]);

  useEffect(() => {
    setSearchQuery(queryQ);
  }, [queryQ]);

  useEffect(() => {
    movieApi.getGenres()
      .then((res) => {
        if (Array.isArray(res)) {
          const names = ['Tất cả thể loại', ...res.map((g) => g.name)];
          setAvailableGenres(names);
        }
      })
      .catch(() => {
        setAvailableGenres(GENRE_OPTIONS); //
      });
  }, []);

  useEffect(() => {
    setActiveTab(queryStatus);
    setSelectedGenre(queryGenre);
    setSortBy(querySort);
  }, [queryStatus, queryGenre, querySort]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const timer = setTimeout(async () => {
      try {
        const [showing, coming] = await Promise.all([
          movieApi.getNowShowingMovies(searchQuery, controller.signal),
          movieApi.getComingSoonMovies(searchQuery, controller.signal),
        ]);
        if (!controller.signal.aborted) {
          setUsingMock(false);
          setApiMovies([
            ...showing.map((movie) => ({ ...movie, status: 'NOW_SHOWING' })),
            ...coming.map((movie) => ({ ...movie, status: 'COMING_SOON' })),
          ].map((movie) => ({ ...movie, genre: (movie.genres ?? []).join(', ') })));
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const fallback = shouldUseMockMovies(err);
          setUsingMock(fallback);
          setApiMovies(fallback ? searchMockMovies(searchQuery) : []);
          if (!fallback) setError(errorMessage(err));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery, reloadKey]);


  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== 'ALL' && value !== 'Tất cả thể loại' && value !== 'recommended') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    updateUrlParams({ q: value });
  };

  const handleTabChange = (status) => {
    setActiveTab(status);
    updateUrlParams({ status });
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    updateUrlParams({ genre });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateUrlParams({ sort });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveTab('ALL');
    setSelectedGenre('Tất cả thể loại');
    setSortBy('recommended');
    setSearchParams({});
  };

  const dataSource = apiMovies;
  const matchedBySearch = useMemo(() => selectedGenre === 'Tất cả thể loại'
    ? dataSource
    : dataSource.filter((movie) => movie.genres?.includes(selectedGenre)),
    [dataSource, selectedGenre]);
  const countAll = matchedBySearch.length;
  const countNowShowing = matchedBySearch.filter((m) => m.status === 'NOW_SHOWING').length;
  const countComingSoon = matchedBySearch.filter((m) => m.status === 'COMING_SOON').length;

  const displayMovies = useMemo(() => {

    let result = matchedBySearch;

    if (activeTab === 'NOW_SHOWING') {
      result = result.filter((m) => m.status === 'NOW_SHOWING');
    } else if (activeTab === 'COMING_SOON') {
      result = result.filter((m) => m.status === 'COMING_SOON');
    }

    if (sortBy === 'release_desc') {
      result = [...result].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    } else if (sortBy === 'duration_asc') {
      result = [...result].sort((a, b) => a.duration - b.duration);
    } else if (sortBy === 'duration_desc') {
      result = [...result].sort((a, b) => b.duration - a.duration);
    }

    return result;
  }, [matchedBySearch, activeTab, sortBy]);

  return (
    <div className="py-5 sm:py-8 px-4 sm:px-6 lg:px-8 w-full min-w-0 max-w-7xl mx-auto space-y-5 sm:space-y-7">

      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <Link to="/trang-chu" className="hover:text-white transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-200 font-medium">Danh sách phim</span>
        {searchQuery.trim() && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-brand font-medium truncate max-w-[200px]">
              "{searchQuery}"
            </span>
          </>
        )}
      </nav>

      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-7 bg-brand rounded-full" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Danh sách phim
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Khám phá danh sách các phim đang chiếu và sắp chiếu tại Galaxy Cinema. Tìm kiếm phim yêu thích và đặt vé xem ngay hôm nay.
        </p>
      </div>

      <MovieFilters
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        countAll={countAll}
        countNowShowing={countNowShowing}
        countComingSoon={countComingSoon}
        selectedGenre={selectedGenre}
        handleGenreChange={handleGenreChange}
        availableGenres={genreOptions}
        sortBy={sortBy}
        handleSortChange={handleSortChange}
      />

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-slate-400 border-b border-slate-800/80 pb-3">
        <div>
          {searchQuery.trim() ? (
            <span>
              Tìm thấy <strong className="text-white font-bold">{displayMovies.length}</strong> kết quả cho "
              <span className="text-brand font-semibold break-all">{searchQuery}</span>"
            </span>
          ) : (
            <span>
              Hiển thị <strong className="text-white font-bold">{displayMovies.length}</strong> phim{' '}
              {activeTab === 'ALL'
                ? 'trong danh sách'
                : activeTab === 'NOW_SHOWING'
                ? 'đang chiếu'
                : 'sắp chiếu'}
            </span>
          )}
          {(selectedGenre !== 'Tất cả thể loại' || sortBy !== 'recommended') && (
            <span className="text-slate-400 ml-1.5 hidden sm:inline">(có bộ lọc nâng cao)</span>
          )}
        </div>

        <div className="flex shrink-0 self-end sm:self-auto items-center gap-1 bg-[#131B2A] p-1 rounded-lg border border-[#222E42]">
          <button
            onClick={() => setViewMode('grid')}
            type="button"
            className={`flex size-11 items-center justify-center rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-brand text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Chế độ xem dạng Lưới (Grid)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            type="button"
            className={`flex size-11 items-center justify-center rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-brand text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Chế độ xem dạng Danh sách (List)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {usingMock && !loading && (
        <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Không kết nối được API. Đang hiển thị dữ liệu mẫu để xem thử giao diện; đây không phải lịch chiếu thực tế.
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-2 flex min-h-11 items-center underline font-semibold sm:mt-0 sm:inline-flex sm:ml-3">
            Thử kết nối lại
          </button>
        </div>
      )}
      <MovieResults
        loading={loading}
        error={error}
        displayMovies={displayMovies}
        viewMode={viewMode}
        searchQuery={searchQuery}
        handleResetFilters={handleResetFilters}
      />

      <div className="p-4 rounded-xl bg-[#101726] border border-[#1E293B] flex items-start gap-3 leading-relaxed text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-brand shrink-0" />
        <span>
          Không tìm thấy phim bạn muốn? Vui lòng thử lại với từ khóa khác hoặc liên hệ bộ phận hỗ trợ rạp Galaxy Cinema qua hotline{' '}
          <strong className="text-white">1900 2224</strong>.
        </span>
      </div>
    </div>
  );
}

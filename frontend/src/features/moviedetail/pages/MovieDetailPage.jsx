import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { movieDetailApi } from '../api/movieDetailApi';
import { errorMessage } from '@/services/apiClient';
import TrailerModal from '../components/TrailerModal';
import GalleryModal from '../components/GalleryModal';
import HeroSection from '../components/HeroSection';
import TabNav from '../components/TabNav';
import InfoSection from '../components/InfoSection';
import TrailerSection from '../components/TrailerSection';
import ShowtimesSection from '../components/ShowtimesSection';
import RelatedMovies from '../components/RelatedMovies';
import { getGalleryImages } from '../utils/movieDetailGallery';

export default function MovieDetailPage() {
  const { movieId } = useParams();
  const [movie, setMovie]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('info');
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [galleryOpenIndex, setGalleryOpenIndex] = useState(null);

  const infoRef      = useRef(null);
  const trailerRef   = useRef(null);
  const showtimesRef = useRef(null);
  const relatedRef   = useRef(null);

  useEffect(() => {
    if (!movieId) return;
    const ctrl = new AbortController();
    setLoading(true); setError(''); setMovie(null);
    movieDetailApi.getMovieDetail(movieId, ctrl.signal)
      .then(data => { setMovie(data); setActiveTab('info'); })
      .catch(err => { if (!ctrl.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [movieId]);

  const scrollToTab = (tabId) => {
    setActiveTab(tabId);
    const refMap = { info: infoRef, trailer: trailerRef, showtimes: showtimesRef, related: relatedRef };
    const el = refMap[tabId]?.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleBookNow = () => {
    const el = showtimesRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveTab('showtimes');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 sm:gap-4 text-slate-400">
      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-brand" />
      <p className="text-xs sm:text-sm font-medium">Đang tải thông tin phim...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 sm:gap-5 px-4 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-white">Không thể tải thông tin phim</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm">{error}</p>
      </div>
      <Link
        to="/phim"
        className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand hover:bg-[#E61E43] transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Quay lại danh sách phim
      </Link>
    </div>
  );

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-page text-slate-100">
      {/* Trailer modal */}
      {trailerOpen && movie.trailerUrl && (
        <TrailerModal url={movie.trailerUrl} title={movie.title} onClose={() => setTrailerOpen(false)} />
      )}
      {galleryOpenIndex !== null && (
        <GalleryModal
          images={getGalleryImages(movie)}
          title={movie.title}
          activeIndex={galleryOpenIndex}
          onClose={() => setGalleryOpenIndex(null)}
          onChange={setGalleryOpenIndex}
        />
      )}

      {/* Hero */}
      <HeroSection movie={movie} onWatchTrailer={() => setTrailerOpen(true)} onBookNow={handleBookNow} />

      {/* Tab Nav */}
      <TabNav active={activeTab} onChange={scrollToTab} />

      {/* Page Body: Các section tuần tự cách nhau rõ ràng, co giãn mượt mà giữa mobile và laptop */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12 space-y-8 sm:space-y-12 md:space-y-16">
        {/* 1. Tổng quan */}
        <div ref={infoRef}>
          <InfoSection movie={movie} />
        </div>

        {/* 2. Trailer & Hình ảnh */}
        <div ref={trailerRef}>
          <TrailerSection
            movie={movie}
            onWatchTrailer={() => setTrailerOpen(true)}
            onViewImage={setGalleryOpenIndex}
          />
        </div>

        {/* 3. Lịch chiếu & Đặt vé */}
        <div ref={showtimesRef}>
          <ShowtimesSection movieId={Number(movieId)} movie={movie} />
        </div>

        {/* 4. Phim liên quan */}
        <div ref={relatedRef}>
          <RelatedMovies movieId={Number(movieId)} />
        </div>
      </div>
    </div>
  );
}

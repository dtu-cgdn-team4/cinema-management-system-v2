import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { movieApi } from '@/features/movies/api/movieApi';
import { errorMessage } from '@/services/apiClient';
import auditorium from '@/assets/cinema-auditorium.jpg';
import TrailerDialog from '../components/TrailerDialog';
import HomeNews from '../components/HomeNews';
import HomeBanner from '../components/HomeBanner';
import QuickBooking from '../components/QuickBooking';
import FeaturedMovieCard from '../components/FeaturedMovieCard';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [trailer, setTrailer] = useState(null);
  const [movieId, setMovieId] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setMovieId('');
    Promise.all([movieApi.getNowShowingMovies('', controller.signal), movieApi.getFeaturedMovies(controller.signal)]).then(([showing, selected]) => {
      if (controller.signal.aborted) return;
      setMovies(showing.map((movie) => ({ ...movie, status: 'NOW_SHOWING' })));
      setFeatured(selected.map((movie) => ({ ...movie, genre: (movie.genres ?? []).join(', ') })));
    }).catch((err) => {
      if (controller.signal.aborted) return;
      setFeatured([]);
      setMovies([]);
      setError(errorMessage(err));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  return (
    <div className="pb-4">
      <HomeBanner />
      <QuickBooking key={`${movieId}-${reload}`} movies={loading ? [] : movies} movieId={movieId} onMovieChange={setMovieId} demo={false} />
      <section aria-labelledby="featured-films" className="mx-auto max-w-304 px-4 py-12 sm:py-16 xl:px-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">Đề cử từ Galaxy</p><h1 id="featured-films" className="text-2xl font-extrabold uppercase sm:text-3xl">Phim nổi bật</h1></div>
          <Link to="/phim" className="flex min-h-11 items-center gap-2 text-sm text-muted hover:text-white">Tất cả phim <ArrowRight size={16} /></Link>
        </div>
        {error && <p role="alert" className="mt-5 text-red-300">{error} <button type="button" onClick={() => setReload((n) => n + 1)} className="min-h-11 underline">Thử lại</button></p>}
        {loading ? <p role="status" className="py-16 text-center text-muted">Đang tải phim nổi bật…</p> : featured.length ? <div className="mt-7 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 lg:grid-cols-4 sm:gap-6">{featured.map((movie) => <FeaturedMovieCard key={movie.id} movie={movie} onTrailer={setTrailer} />)}</div> : !error && <p className="py-12 text-center text-muted">Chưa có phim được chọn giới thiệu.</p>}
        <div className="flex justify-center">
          {!loading && featured.length > 0 && <Link to="/phim" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand/40 px-5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white">Xem thêm <ArrowRight size={18} /></Link>}
        </div>
      </section>
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-304 items-center gap-8 px-4 py-12 sm:py-16 lg:grid-cols-2 xl:px-0">
          <div className="relative overflow-hidden rounded-2xl"><img src={auditorium} alt="Không gian phòng chiếu điện ảnh" loading="lazy" className="aspect-[4/3] w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" /><p className="absolute bottom-6 left-6 right-6 text-2xl font-bold">Mọi cảm xúc. Một màn ảnh.</p></div>
          <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand">Trải nghiệm Galaxy</p><h2 className="text-2xl font-extrabold uppercase leading-tight sm:text-4xl">Nâng tầm trải nghiệm điện ảnh</h2><p className="my-6 text-sm leading-7 text-muted">Tạm gác nhịp sống thường ngày, đắm mình trong những câu chuyện đầy cảm xúc. Một không gian dành cho bạn và những người cùng yêu điện ảnh.</p><Link to="/lich-chieu" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold">Khám phá lịch chiếu <ArrowRight size={16} /></Link></div>
        </div>
      </section>
      <HomeNews />
      {trailer && <TrailerDialog movie={trailer} onClose={() => setTrailer(null)} />}
    </div>
  );
}

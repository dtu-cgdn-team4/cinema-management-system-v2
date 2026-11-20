import { Play, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import AgeBadge from '@/components/common/AgeBadge';
import fallbackPoster from '@/assets/cinema-auditorium.jpg';
import { youtubeVideoId } from './TrailerDialog';

export default function FeaturedMovieCard({ movie, onTrailer }) {
  const hasTrailer = Boolean(youtubeVideoId(movie.trailerUrl));
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-brand/60 hover:shadow-xl hover:shadow-brand/10 motion-reduce:transform-none">
      <Link to={`/phim/${movie.id}`} aria-label={`Mua vé ${movie.title}`} className="group relative aspect-[2/3] cursor-pointer overflow-hidden text-left">
        <img src={movie.posterUrl || fallbackPoster} alt={movie.title} loading="lazy" onError={(event) => { if (event.currentTarget.dataset.fallback) return; event.currentTarget.dataset.fallback = 'true'; event.currentTarget.src = fallbackPoster; }} className="h-full w-full object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute left-3 top-3"><AgeBadge rating={movie.ageRating} /></div>
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="truncate text-[10px] uppercase tracking-wider text-muted">{movie.genre}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold sm:text-base">{movie.title}</h3>
        <p className="mt-1 text-xs text-muted">{movie.duration} phút · {movie.status === 'COMING_SOON' ? 'Sắp khởi chiếu' : 'Đang khởi chiếu'}</p>
        <div className="mt-auto pt-3"><div className="flex gap-2 border-t border-line pt-3">
          <button type="button" aria-label={`Xem trailer ${movie.title}`} title={hasTrailer ? 'Xem trailer YouTube' : 'Chưa có trailer'} disabled={!hasTrailer} onClick={() => onTrailer(movie)} className="flex size-11 cursor-pointer shrink-0 items-center justify-center rounded-lg border border-line text-muted transition hover:border-brand hover:bg-brand/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"><Play size={17} /></button>
          <Link to={`/phim/${movie.id}`} className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-2 text-xs font-semibold transition hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25"><Ticket size={16} className="shrink-0" />Mua vé</Link>
        </div></div>
      </div>
    </article>
  );
}

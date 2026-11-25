import { Play, Film, Image as ImageIcon } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { getGalleryImages } from '../utils/movieDetailGallery';

export default function TrailerSection({ movie, onWatchTrailer, onViewImage }) {
  const galleryImages = getGalleryImages(movie);

  return (
    <div>
      <SectionHeading right={movie.title ? `Thế giới ${movie.title} trên màn ảnh rộng` : undefined}>
        Trailer &amp; Hình ảnh
      </SectionHeading>

      <div className="grid grid-cols-1 items-stretch gap-2.5 sm:gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Trailer một bên, hai ảnh xếp dọc ở bên còn lại. */}
        <div
          onClick={movie.trailerUrl ? onWatchTrailer : undefined}
          onKeyDown={movie.trailerUrl ? (event) => { if (event.key === 'Enter' || event.key === ' ') onWatchTrailer(); } : undefined}
          role={movie.trailerUrl ? 'button' : undefined}
          tabIndex={movie.trailerUrl ? 0 : undefined}
          className={`relative aspect-video min-w-0 overflow-hidden rounded-xl border border-line bg-slate-900 shadow-xl shadow-black/50 sm:rounded-2xl ${movie.trailerUrl ? 'group cursor-pointer' : ''}`}
        >
          {(movie.backdropUrl || movie.posterUrl) ? (
            <img
              src={movie.backdropUrl || movie.posterUrl}
              alt={`Trailer – ${movie.title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <Film className="w-10 h-10 sm:w-14 sm:h-14 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors" />

          {/* Play button */}
          {movie.trailerUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-full bg-brand/90 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-brand transition-transform duration-300">
                <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-white text-white ml-0.5 sm:ml-1" />
              </div>
            </div>
          )}

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/90 to-transparent">
            <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Trailer</p>
            <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">{movie.title}</p>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-2 sm:gap-3">
          {galleryImages.length > 0 ? (
            galleryImages.map((img, i) => (
              <div
                key={i}
                className="relative aspect-video min-h-0 min-w-0 overflow-hidden rounded-lg border border-line bg-slate-900 shadow-md shadow-black/40 sm:rounded-xl sm:shadow-lg"
              >
                <button type="button" onClick={() => onViewImage(i)} className="group h-full w-full cursor-zoom-in" aria-label={`Xem hình ${i + 1} của ${movie.title}`}>
                  <img
                    src={img}
                    alt={`Hình ảnh ${i + 1} – ${movie.title}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
                {/* Nút "Xem hình ảnh" ở ảnh thứ 2 */}
                {i === 1 && (
                  <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5">
                    <button
                      type="button"
                      onClick={() => onViewImage(i)}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-black/75 backdrop-blur-sm text-[10px] sm:text-xs font-semibold text-white border border-white/20 hover:bg-black/95 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Xem hình ảnh</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            [0, 1].map(i => (
              <div key={i} className="flex-1 aspect-video md:aspect-auto rounded-lg sm:rounded-xl bg-slate-900 border border-line flex items-center justify-center">
                <Film className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SHOWTIMES SECTION (3 bước + sidebar)
═══════════════════════════════════════ */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Ticket, Info } from 'lucide-react';
import AgeBadge from './AgeBadge';

export default function MovieCard({ movie }) {
  const navigate = useNavigate();

  const handleBooking = (e) => {
    e.stopPropagation();
    // Chuyển hướng tới đặt vé hoặc hiển thị thông báo
    alert(`Chuyển đến chọn suất chiếu cho phim: ${movie.title}`);
  };

  const handleDetail = (e) => {
    e.stopPropagation();
    alert(`Xem chi tiết phim: ${movie.title}`);
  };

  return (
    <div className="group bg-[#131B2A] rounded-xl overflow-hidden border border-[#222E42] hover:border-brand/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand/10 flex flex-col">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131B2A] via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Age Rating Badge (Top Left) */}
        <div className="absolute top-3 left-3 z-10">
          <AgeBadge rating={movie.ageRating} size="md" className="shadow-md" />
        </div>

        {/* Formats badge (Bottom Right of Poster) */}
        {movie.formats && movie.formats.length > 0 && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 backdrop-blur-sm text-slate-300 border border-slate-700/60">
              {movie.formats[0]}
            </span>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            title={movie.title}
            className="text-base font-bold text-white group-hover:text-brand transition-colors line-clamp-1"
          >
            {movie.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-medium">
            {movie.genre}
          </p>

          <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{movie.duration} phút</span>
            </div>
            {movie.releaseDate && (
              <span className="text-[11px] text-slate-500 font-mono">
                {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={handleDetail}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Chi tiết</span>
          </button>

          <button
            onClick={handleBooking}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-brand to-[#FF4D6D] hover:from-[#E61E43] hover:to-brand shadow-md shadow-brand/20 hover:shadow-brand/30 transition-all hover:scale-[1.02]"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Đặt vé</span>
          </button>
        </div>
      </div>
    </div>
  );
}


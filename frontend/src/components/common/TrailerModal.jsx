import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function TrailerModal({ url, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const embedUrl = (() => {
    if (!url) return '';
    try {
      const u = new URL(url);
      const hostname = u.hostname.toLowerCase();
      const youtubeHosts = new Set([
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtube-nocookie.com',
        'www.youtube-nocookie.com',
        'youtu.be',
      ]);
      if (!youtubeHosts.has(hostname)) return '';

      const videoId = hostname === 'youtu.be'
        ? u.pathname.split('/').filter(Boolean)[0]
        : u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      if (!videoId || !/^[\w-]{11}$/.test(videoId)) return '';
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } catch {
      // Invalid URLs are not embedded.
      return '';
    }
  })();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-3 sm:p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        {embedUrl ? (
          <iframe src={embedUrl} title={`Trailer – ${title}`} className="w-full h-full" referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs sm:text-sm">Không thể phát trailer này.</div>
        )}
        <button onClick={onClose} className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer" aria-label="Đóng">
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}


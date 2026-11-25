import { useEffect } from 'react';

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
          <iframe src={embedUrl} title={`Trailer – ${title}`} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs sm:text-sm">Không thể phát trailer này.</div>
        )}
      </div>
    </div>
  );
}

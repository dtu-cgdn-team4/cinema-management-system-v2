import TrailerModal from '@/components/common/TrailerModal';

export function youtubeVideoId(url) {
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return null;
    const host = parsed.hostname.replace(/^www\./, '');
    const id = host === 'youtu.be' ? parsed.pathname.slice(1)
      : ['youtube.com', 'm.youtube.com'].includes(host)
        ? parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
        : null;
    return /^[\w-]{11}$/.test(id ?? '') ? id : null;
  } catch { return null; }
}

export default function TrailerDialog({ movie, onClose }) {
  return <TrailerModal url={movie.trailerUrl} title={movie.title} onClose={onClose} />;
}

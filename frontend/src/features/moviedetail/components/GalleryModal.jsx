import { useEffect } from 'react';
import { ChevronLeft, ChevronRight as ChevronRightIcon, X } from 'lucide-react';

export default function GalleryModal({ images, title, activeIndex, onClose, onChange }) {
  const activeImage = images[activeIndex];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange((activeIndex - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') onChange((activeIndex + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeIndex, images.length, onChange, onClose]);

  if (!activeImage) return null;

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-black/95 p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div className="relative flex max-h-full w-full max-w-6xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
        <img src={activeImage} alt={`${title} – hình ${activeIndex + 1}`} className="max-h-[85vh] max-w-full rounded-xl object-contain" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onChange((activeIndex - 1 + images.length) % images.length)}
              aria-label="Xem ảnh trước"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onChange((activeIndex + 1) % images.length)}
              aria-label="Xem ảnh tiếp theo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
          {activeIndex + 1} / {images.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thư viện ảnh"
          className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SECTION HEADING (Vạch đỏ bên trái)
═══════════════════════════════════════ */

import { useRef, useState } from 'react';
import { Download, Sun } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function TicketQrPanel({ bookingCode }) {
  const qrContainerRef = useRef(null);
  const [isBright, setIsBright] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');

  const handleDownload = () => {
    const canvas = qrContainerRef.current?.querySelector('canvas');
    if (!canvas || !bookingCode) {
      setDownloadMessage('Không thể tạo ảnh QR lúc này.');
      return;
    }

    try {
      const bounds = canvas.getBoundingClientRect();
      const quietZone = Math.max(16, Math.round((canvas.width / bounds.width) * 12));
      const imageCanvas = document.createElement('canvas');
      imageCanvas.width = canvas.width + quietZone * 2;
      imageCanvas.height = canvas.height + quietZone * 2;
      const context = imageCanvas.getContext('2d');
      if (!context) throw new Error('Canvas context is unavailable');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
      context.drawImage(canvas, quietZone, quietZone);

      const link = document.createElement('a');
      link.download = `${bookingCode}-QR.png`;
      link.href = imageCanvas.toDataURL('image/png');
      link.click();
      setDownloadMessage('Đã lưu ảnh QR.');
    } catch {
      setDownloadMessage('Không thể lưu ảnh QR trên thiết bị này.');
    }
  };

  return (
    <aside className="border-t border-[#252d3b] bg-[#141720] p-5 sm:p-7 md:border-l md:border-t-0 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">
          Mã đặt vé điện tử
        </p>
        <button
          type="button"
          onClick={() => setIsBright((value) => !value)}
          aria-pressed={isBright}
          className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-amber-400 transition hover:text-amber-300"
        >
          <Sun size={13} />
          {isBright ? 'Giảm sáng' : 'Tăng sáng'}
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-[#293141] bg-[#0b0d12] px-3 py-3 text-center font-mono text-lg font-bold tracking-[0.16em] text-white [overflow-wrap:anywhere] sm:text-xl sm:tracking-[0.2em]">
        {bookingCode}
      </div>

      <div
        ref={qrContainerRef}
        role="img"
        aria-label={`Mã QR cho vé ${bookingCode}`}
        className={`mx-auto mt-5 w-fit rounded-2xl p-3 shadow-lg transition-colors ${isBright ? 'bg-white' : 'bg-zinc-200'}`}
      >
        <QRCodeCanvas
          value={bookingCode}
          size={220}
          level="M"
          bgColor={isBright ? '#ffffff' : '#e4e4e7'}
          fgColor="#000000"
        />
      </div>

      <p className="mx-auto mt-4 max-w-xs text-center text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
        Đưa mã QR cho nhân viên tại quầy hoặc cửa soát vé rạp Galaxy Lumière.
      </p>

      <button
        type="button"
        onClick={handleDownload}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#303747] bg-[#202735] px-4 py-2.5 text-xs font-semibold text-zinc-100 transition hover:bg-[#293345]"
      >
        <Download size={14} />
        Lưu ảnh QR
      </button>
      <p aria-live="polite" className="mt-2 min-h-4 text-center text-[11px] text-zinc-400">
        {downloadMessage}
      </p>
    </aside>
  );
}

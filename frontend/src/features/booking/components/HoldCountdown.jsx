import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Thời gian giữ ghế còn lại tới `expiresAt` (giờ server, Việt Nam); hết giờ thì gọi `onExpire`. */
export default function HoldCountdown({ expiresAt, onExpire }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = Math.max(0, Math.ceil((new Date(expiresAt) - now) / 1000));
  useEffect(() => {
    if (left === 0) onExpire();
  }, [left, onExpire]);

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-brand/25 bg-brand/10 px-4 py-3">
      <Timer size={20} strokeWidth={1.5} absoluteStrokeWidth className="shrink-0 text-brand" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.75">
        <p className="text-xs text-zinc-300">Thời gian giữ ghế còn lại</p>
        <p className="text-[10px] leading-3.75 text-muted">Hoàn tất thanh toán trước khi hết giờ.</p>
      </div>
      <span role="timer" className="text-base leading-6 font-black text-brand tabular-nums">
        {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
      </span>
    </div>
  );
}

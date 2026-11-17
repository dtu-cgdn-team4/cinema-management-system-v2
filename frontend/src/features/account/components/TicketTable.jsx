import { formatVnd, formatDate, formatTime } from '@/utils/format';
import TicketStatusBadge from './TicketStatusBadge';
import { Ticket as TicketIcon } from 'lucide-react';

export default function TicketTable({ tickets, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex-1 rounded-2xl border border-white/5 bg-[#12141c] overflow-hidden p-6 animate-pulse space-y-4">
        <div className="h-6 bg-white/10 rounded w-1/3" />
        <div className="h-20 bg-white/5 rounded-xl" />
        <div className="h-20 bg-white/5 rounded-xl" />
        <div className="h-20 bg-white/5 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 rounded-2xl border border-white/5 bg-[#12141c] flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
          <TicketIcon size={22} className="text-[#ea384d]" />
        </div>
        <p className="text-sm font-semibold text-white mb-1">Không thể tải dữ liệu</p>
        <p className="text-xs text-zinc-400 max-w-sm">{error}</p>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex-1 rounded-2xl border border-white/5 bg-[#12141c] flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
          <TicketIcon size={26} className="text-zinc-500" />
        </div>
        <p className="text-sm font-semibold text-white mb-1">Chưa có vé nào</p>
        <p className="text-xs text-zinc-400 max-w-sm">
          Bạn chưa có giao dịch đặt vé nào trong tài khoản.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Bảng vé */}
      <div className="rounded-2xl border border-white/5 bg-[#12141c] overflow-hidden shadow-xl">
        {/* Header các cột */}
        <div className="hidden lg:grid grid-cols-[160px_1fr_130px_130px_220px] items-center border-b border-white/5 px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <span>MÃ ĐẶT VÉ</span>
          <span>PHIM</span>
          <span>NGÀY ĐẶT</span>
          <span>TỔNG TIỀN</span>
          <span>TRẠNG THÁI</span>
        </div>

        {/* Danh sách các vé */}
        <div className="divide-y divide-white/5">
          {tickets.map((ticket) => (
            <TicketRow key={ticket.bookingCode} ticket={ticket} />
          ))}
        </div>
      </div>

      {/* Dòng ghi chú dưới bảng khớp ảnh thiết kế */}
      <p className="text-xs text-zinc-500 mt-3 px-1">
        Vé đã thanh toán không thể đổi hoặc hoàn tiền.
      </p>
    </div>
  );
}

function TicketRow({ ticket }) {
  const { bookingCode, movie, showtime, bookedAt, totalAmount, bookingStatus } = ticket;

  // Ghép chuỗi giờ chiếu: 14:30 · 04/11/2026 · Phòng 01
  const showtimeText = showtime?.startsAt
    ? `${formatTime(showtime.startsAt)} · ${formatDate(showtime.startsAt)} · ${showtime.roomName || ''}`
    : '';

  const handleViewTicket = () => {
    alert(`Chức năng chi tiết vé (${bookingCode}) đang được phát triển.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_130px_130px_220px] items-center gap-4 lg:gap-0 px-7 py-5 hover:bg-white/[0.02] transition">
      {/* Cột 1: Mã đặt vé */}
      <div>
        <span className="text-[11px] font-bold uppercase text-zinc-400 lg:hidden block mb-1">
          Mã đặt vé:
        </span>
        <span className="text-sm font-medium text-white tracking-wide">
          {bookingCode}
        </span>
      </div>

      {/* Cột 2: Phim */}
      <div className="flex items-center gap-3.5 pr-4">
        {movie?.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-11 h-16 rounded-lg object-cover shrink-0 border border-white/10"
            loading="lazy"
          />
        ) : (
          <div className="w-11 h-16 rounded-lg bg-white/5 shrink-0 flex items-center justify-center border border-white/10">
            <TicketIcon size={16} className="text-zinc-500" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">
            {movie?.title || 'Chưa cập nhật'}
          </p>
          {showtimeText && (
            <p className="text-xs text-zinc-400 mt-1 truncate">
              {showtimeText}
            </p>
          )}
        </div>
      </div>

      {/* Cột 3: Ngày đặt */}
      <div>
        <span className="text-[11px] font-bold uppercase text-zinc-400 lg:hidden block mb-1">
          Ngày đặt:
        </span>
        <span className="text-sm text-zinc-300">
          {bookedAt ? formatDate(bookedAt) : '—'}
        </span>
      </div>

      {/* Cột 4: Tổng tiền */}
      <div>
        <span className="text-[11px] font-bold uppercase text-zinc-400 lg:hidden block mb-1">
          Tổng tiền:
        </span>
        <span className="text-sm font-bold text-white">
          {totalAmount ? formatVnd(totalAmount) : '—'}
        </span>
      </div>

      {/* Cột 5: Trạng thái & nút Xem vé */}
      <div className="flex items-center justify-between lg:justify-start gap-5">
        <TicketStatusBadge status={bookingStatus} />
        <button
          type="button"
          onClick={handleViewTicket}
          className="text-xs font-semibold text-[#ea384d] hover:text-[#ff4d6d] transition cursor-pointer"
        >
          Xem vé
        </button>
      </div>
    </div>
  );
}

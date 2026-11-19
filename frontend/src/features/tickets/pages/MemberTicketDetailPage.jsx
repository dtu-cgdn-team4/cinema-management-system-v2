import { useAuth } from '@/context/AuthContext';
import { AlertCircle, ArrowLeft, Clock3, FileText, MapPin, Plus, Ticket } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import PaymentDetailsCard from '../components/PaymentDetailsCard';
import useMemberTicketDetail from '../hooks/useMemberTicketDetail';

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

function asVietnamDate(value) {
  if (!value) return null;
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  return new Date(hasTimeZone ? value : `${value}+07:00`);
}

function formatTicketDate(value) {
  const date = asVietnamDate(value);
  if (!date || Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: VIETNAM_TIME_ZONE,
  }).format(date);
}

function formatTicketTime(value) {
  const date = asVietnamDate(value);
  if (!date || Number.isNaN(date.getTime())) return '--:--';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: VIETNAM_TIME_ZONE,
  }).format(date);
}

function getStatus(ticket) {
  if (ticket.collectedAt) return { label: 'Đã sử dụng', color: 'text-sky-300 bg-sky-400/10 border-sky-400/30' };
  if (ticket.bookingStatus === 'DA_THANH_TOAN') {
    return { label: 'Đã thanh toán', color: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30' };
  }
  return { label: ticket.bookingStatus || 'Chưa cập nhật', color: 'text-zinc-300 bg-white/5 border-white/10' };
}

function TicketDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-12" aria-label="Đang tải chi tiết vé">
      <div className="mb-8 h-4 w-40 rounded bg-white/10" />
      <div className="mb-6 h-9 w-64 rounded bg-white/10" />
      <div className="grid gap-6 rounded-2xl border border-white/10 bg-[#12141c] p-6 md:grid-cols-[220px_1fr]">
        <div className="h-72 rounded-xl bg-white/10" />
        <div className="space-y-5 py-2">
          <div className="h-8 w-3/4 rounded bg-white/10" />
          <div className="h-5 w-1/2 rounded bg-white/10" />
          <div className="h-28 rounded-xl bg-white/5" />
          <div className="h-20 rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function TicketDetailError({ error, isNotFound, onRetry }) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-brand">
        <AlertCircle size={26} />
      </span>
      <h1 className="text-xl font-bold text-white">
        {isNotFound ? 'Không tìm thấy vé' : 'Không thể tải chi tiết vé'}
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        {isNotFound
          ? 'Vé không tồn tại, chưa thanh toán hoặc không thuộc tài khoản của bạn.'
          : error}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!isNotFound && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Thử lại
          </button>
        )}
        <Link
          to="/tai-khoan/ve-da-dat"
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Về danh sách vé
        </Link>
      </div>
    </section>
  );
}

function DetailItem({ label, children, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="mt-1.5 text-sm font-semibold text-white">{children || 'Chưa cập nhật'}</div>
    </div>
  );
}

export default function MemberTicketDetailPage() {
  const { bookingCode } = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { ticket, isLoading, error, isNotFound, reload } = useMemberTicketDetail(
    bookingCode,
    !authLoading && isAuthenticated,
  );

  if (authLoading) return <TicketDetailLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: `/tai-khoan/ve-da-dat/${bookingCode}` }} replace />;
  }
  if (isLoading) return <TicketDetailLoading />;
  if (error || !ticket) return <TicketDetailError error={error} isNotFound={isNotFound} onRetry={reload} />;

  const status = getStatus(ticket);
  const showtime = ticket.showtime ?? {};
  const movie = ticket.movie ?? {};
  const seats = ticket.seats ?? [];
  const seatLabels = seats.map(({ rowName, number, type }) => ({
    label: `${rowName ?? ''}${number ?? ''}`,
    type,
  })).filter(({ label }) => label);

  return (
    <main className="min-h-[calc(100vh-200px)] bg-page text-white">
      <div className="mx-auto max-w-[1104px] px-4 pb-16 pt-7">
        <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-zinc-400">
          <Link to="/phim" className="transition hover:text-white">Trang chủ</Link>
          <span aria-hidden="true">›</span>
          <Link to="/tai-khoan/ve-da-dat" className="transition hover:text-white">Vé của tôi</Link>
          <span aria-hidden="true">›</span>
          <span className="text-white">Chi tiết vé</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-brand" />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Vé của tôi</h1>
              <p className="mt-1 text-sm text-zinc-400">Mã đặt vé: <span className="font-semibold text-white">{ticket.bookingCode}</span></p>
            </div>
          </div>
          <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${status.color}`}>
            {status.label}
          </span>
        </div>

        <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#2b3342] bg-gradient-to-r from-[#1b202b] to-[#171a23] p-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand/40 bg-brand/10 text-brand">
              <Clock3 size={18} />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-white sm:text-sm">
                Suất chiếu lúc <span className="font-bold text-rose-400">{showtime.startsAt ? formatTicketTime(showtime.startsAt) : '--:--'}</span>
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {showtime.startsAt ? formatTicketDate(showtime.startsAt) : 'Ngày chiếu chưa cập nhật'}
                {' · '}
                {ticket.cinema?.name || 'Chưa cập nhật rạp'}
                {ticket.room?.name ? ` · ${ticket.room.name}` : ''}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#252d3b] bg-[#171a23] shadow-xl">
          <div className="grid md:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="flex items-start gap-5">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={`Poster phim ${movie.title || ''}`}
                    className="aspect-[2/3] w-24 shrink-0 rounded-xl border border-white/10 object-cover sm:w-28"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-zinc-500 sm:w-28">
                    <Ticket size={24} />
                    <span className="text-[10px]">Chưa có poster</span>
                  </div>
                )}

                <div className="min-w-0 pt-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    {movie.ageRating && <span className="rounded border border-brand/50 bg-brand/10 px-2 py-1 font-bold text-rose-300">{movie.ageRating}</span>}
                    {movie.durationMinutes > 0 && <span>{movie.durationMinutes} phút</span>}
                  </div>
                  <h2 className="mt-3 text-xl font-bold leading-tight sm:text-2xl">{movie.title || 'Chưa cập nhật tên phim'}</h2>
                  <div className="mt-3 flex items-start gap-2 text-sm text-zinc-300">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
                    <div>
                      <p className="font-medium text-white">{ticket.cinema?.name || 'Chưa cập nhật rạp'}</p>
                      {ticket.cinema?.address && <p className="mt-1 text-xs leading-relaxed text-zinc-400">{ticket.cinema.address}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-white/10 pt-6 sm:gap-x-8 sm:gap-y-6">
                <DetailItem label="Rạp chiếu">{ticket.cinema?.name}</DetailItem>
                <DetailItem label="Phòng chiếu">{ticket.room?.name}</DetailItem>
                <DetailItem label="Ngày chiếu">{formatTicketDate(showtime.startsAt)}</DetailItem>
                <DetailItem label="Suất chiếu">
                  {showtime.startsAt
                    ? `${formatTicketTime(showtime.startsAt)} – ${formatTicketTime(showtime.endsAt)}`
                    : 'Chưa cập nhật'}
                </DetailItem>
                <DetailItem label={`Ghế ngồi (${ticket.seatCount ?? seats.length})`} className="col-span-2">
                  {seatLabels.length ? (
                    <span className="flex flex-wrap gap-2">
                      {seatLabels.map(({ label, type }) => (
                        <span key={label} className="inline-flex items-center gap-1.5">
                          {label}
                          {type && <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-400">{type}</span>}
                        </span>
                      ))}
                    </span>
                  ) : 'Chưa cập nhật'}
                </DetailItem>
              </div>
            </div>

            <aside className="border-t border-[#252d3b] bg-[#141720] p-5 sm:p-7 md:border-l md:border-t-0 lg:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">Mã đặt vé điện tử</p>
              <div className="mt-3 rounded-xl border border-[#293141] bg-[#0b0d12] px-3 py-3 text-center font-mono text-lg font-bold tracking-[0.16em] text-white [overflow-wrap:anywhere] sm:text-xl sm:tracking-[0.2em]">
                {ticket.bookingCode}
              </div>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
                Mã vé được tạo khi đặt vé và lưu trong hệ thống.
              </p>
            </aside>
          </div>
        </section>

        <PaymentDetailsCard ticket={ticket} />

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled
            title="Hóa đơn điện tử chưa khả dụng"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-[#344052] bg-[#121927] px-5 py-3 text-sm font-semibold text-zinc-400 opacity-70"
          >
            <FileText size={16} />
            Xem hóa đơn điện tử
          </button>
          {ticket.movie?.id && (
            <Link
              to={`/phim/${ticket.movie.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-[#344052] bg-[#121927] px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-[#ea384d]/50 hover:bg-[#1b2230]"
            >
              <Plus size={17} className="text-emerald-400" />
              Đặt thêm vé / suất khác
            </Link>
          )}
        </div>

        <Link
          to="/tai-khoan/ve-da-dat"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách vé
        </Link>
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { errorMessage } from '@/services/apiClient';
import MovieFilterSelect from '@/features/movies/components/MovieFilterSelect';
import { formatTime } from '@/utils/format';

export default function QuickBooking({ movies, movieId, onMovieChange, demo }) {
  const navigate = useNavigate();
  const [cinemaId, setCinemaId] = useState('');
  const [date, setDate] = useState('');
  const [showtimeId, setShowtimeId] = useState('');
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const movie = movies.find((item) => String(item.id) === movieId);

  useEffect(() => {
    if (!movieId || demo) return;
    const controller = new AbortController();
    setError('');
    setLoading(true);
    apiClient.get(`/movies/${movieId}/showtimes`, { signal: controller.signal, timeout: 8000 })
      .then((data) => { if (!controller.signal.aborted) setShowtimes(data.filter((s) => s.availableSeats > 0 && new Date(`${s.startTime}+07:00`) > new Date())); })
      .catch((err) => { if (!controller.signal.aborted) { setShowtimes([]); setError(errorMessage(err)); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [movieId, demo, retry]);

  const cinemas = [...new Map(showtimes.map((s) => [String(s.cinemaId), { id: s.cinemaId, name: s.cinemaName }])).values()];
  const days = [...new Set(showtimes.filter((s) => String(s.cinemaId) === cinemaId).map((s) => s.startTime.slice(0, 10)))].sort();
  const times = showtimes.filter((s) => String(s.cinemaId) === cinemaId && s.startTime.startsWith(date));

  const selected = showtimes.find((s) => String(s.id) === showtimeId);
  const fields = [
    { label: 'Chọn phim', value: movieId, options: movies.map((m) => ({ value: String(m.id), label: m.title })), disabled: !movies.length,
      change: (value) => { if (value === movieId) return; setCinemaId(''); setDate(''); setShowtimeId(''); setShowtimes([]); onMovieChange(value); } },
    { label: 'Chọn rạp', value: cinemaId, options: cinemas.map((c) => ({ value: String(c.id), label: c.name })), disabled: !movieId || demo || !cinemas.length,
      change: (value) => { setCinemaId(value); setDate(''); setShowtimeId(''); } },
    { label: 'Chọn ngày', value: date, options: days.filter((day) => (!movie?.releaseDate || day >= movie.releaseDate) && (!movie?.endDate || day <= movie.endDate)).map((day) => ({ value: day, label: new Date(`${day}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) })), disabled: !cinemaId,
      change: (value) => { setDate(value); setShowtimeId(''); } },
    { label: loading ? 'Đang tải giờ chiếu…' : 'Chọn giờ', value: showtimeId, options: times.map((s) => ({ value: String(s.id), label: `${formatTime(s.startTime)} · ${s.room?.name ?? ''} · ${s.availableSeats} ghế` })), disabled: !date || loading || !times.length,
      change: setShowtimeId },
  ];
  return (
    <form id="quick-booking" className="relative z-10 mx-auto max-w-304 scroll-mt-6 px-4 xl:px-0" onSubmit={(event) => {
      event.preventDefault();
      if (!movie || !selected || !cinemaId || !date || demo || loading) return;
      if (new Date(`${selected.startTime}+07:00`) <= new Date()) { setShowtimeId(''); setError('Suất chiếu đã bắt đầu. Vui lòng chọn giờ khác.'); return; }
      navigate(`/dat-ve/suat-chieu/${selected.id}/chon-ghe`, { state: { movie, showtime: selected } });
    }}>
      <div className="grid rounded-xl border border-line bg-surface shadow-2xl sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto]">
        {fields.map((field, index) => <fieldset key={index} disabled={field.disabled} className="flex min-w-0 items-center gap-2 border-b border-line p-3 disabled:opacity-45 lg:border-b-0 lg:border-r">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold">{index + 1}</span>
          <div className="min-w-0 flex-1"><MovieFilterSelect label={field.label} value={field.value} options={[{ value: '', label: field.label }, ...field.options]} onChange={field.change} disabled={field.disabled} /></div>
        </fieldset>)}
        <button type="submit" disabled={!selected || loading || demo} className="min-h-14 cursor-pointer rounded-b-xl bg-brand px-6 py-4 font-bold transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2 lg:col-span-1 lg:rounded-l-none lg:rounded-r-xl">Mua vé nhanh</button>
      </div>
      {demo && <p className="mt-3 text-sm text-amber-200">Dữ liệu phim mẫu chỉ để xem giao diện. Kết nối lại backend để chọn suất chiếu thật.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error} <button type="button" onClick={() => { setShowtimeId(''); setShowtimes([]); setRetry((n) => n + 1); }} className="min-h-11 underline">Thử lại</button></p>}
      {loading && <p role="status" className="mt-3 text-sm text-muted">Đang tải lịch chiếu của phim…</p>}
      {!error && movieId && !demo && !loading && !showtimes.length && <p role="status" className="mt-3 text-sm text-muted">Phim này chưa có suất chiếu sắp tới còn ghế. Vui lòng chọn phim khác hoặc quay lại khi rạp cập nhật lịch.</p>}
    </form>
  );
}

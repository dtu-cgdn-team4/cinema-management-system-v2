import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../services/apiClient';
import { formatDate, formatTime, fromDateKey } from '../../../utils/format';
import { getCinemas, getShowingMovies, getShowtimes } from '../api/showtimeApi';
import CinemaChips from '../components/CinemaChips';
import DateTabs from '../components/DateTabs';
import MovieShowtimes from '../components/MovieShowtimes';
import NoShowtimes from '../components/NoShowtimes';
import ShowtimeListSkeleton from '../components/ShowtimeListSkeleton';
import { scheduleDays } from '../utils/scheduleDays';

/**
 * SRS 6.2.1 Chọn phim và suất chiếu, giao diện theo frame "Lịch chiếu" của Figma.
 * Ngày và rạp nằm trên URL (`?date=&cinemaId=`) để quay lại từ bước chọn ghế không mất lựa chọn.
 */
export default function ShowtimeSelectionPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const days = useMemo(() => scheduleDays(), []);
  const today = days[0];
  const date = days.includes(params.get('date')) ? params.get('date') : today;

  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [schedule, setSchedule] = useState(null); // null khi đang tải; [{ movie, showtimes }]
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getCinemas(), getShowingMovies()]).then(
      ([cinemaList, movieList]) => {
        setCinemas(cinemaList);
        setMovies(movieList);
        if (cinemaList.length === 0) setSchedule([]);
      },
      (err) => setError(errorMessage(err)),
    );
  }, []);

  const cinema = cinemas.find((c) => c.id === Number(params.get('cinemaId'))) ?? cinemas[0];

  useEffect(() => {
    if (!cinema) return undefined;
    let stale = false;
    setSchedule(null);
    setError(null);
    // ponytail: mỗi phim một request; thêm API suất chiếu theo rạp + ngày nếu số phim đang chiếu lớn
    Promise.all(
      movies
        .filter((movie) => movie.releaseDate <= date && date <= movie.endDate)
        .map((movie) =>
          getShowtimes(movie.id, { cinemaId: cinema.id, date }).then((showtimes) => ({ movie, showtimes })),
        ),
    ).then(
      (rows) => {
        if (stale) return;
        setSchedule(rows.filter((row) => row.showtimes.length > 0));
        setUpdatedAt(new Date());
      },
      (err) => !stale && setError(errorMessage(err)),
    );
    return () => {
      stale = true;
    };
  }, [cinema, movies, date]);

  const select = (key, value) =>
    setParams(
      (prev) => {
        prev.set(key, value);
        return prev;
      },
      { replace: true },
    );

  let content;
  if (error) {
    content = (
      <p role="alert" className="rounded-2xl border border-brand/40 bg-brand/10 px-5 py-4 text-sm text-red-300">
        {error}
      </p>
    );
  } else if (!schedule) {
    content = <ShowtimeListSkeleton />;
  } else if (schedule.length === 0) {
    content = (
      <NoShowtimes
        dayLabel={formatDate(fromDateKey(date)).slice(0, 5)}
        onToday={date === today ? undefined : () => select('date', today)}
      />
    );
  } else {
    content = (
      <>
        <div className="flex flex-col gap-4">
          {schedule.map(({ movie, showtimes }) => (
            <MovieShowtimes
              key={movie.id}
              movie={movie}
              showtimes={showtimes}
              onSelect={(showtimeId) => navigate(`/dat-ve/suat-chieu/${showtimeId}/chon-ghe`)}
            />
          ))}
        </div>
        <p className="text-xs leading-3.75 text-muted">
          Chọn giờ chiếu để chuyển sang bước chọn ghế. Thành viên cần đăng nhập trước khi đặt vé.
        </p>
      </>
    );
  }

  return (
    <div className="mx-auto flex max-w-304 flex-col gap-7 px-4 pt-7 pb-24 xl:px-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-xs leading-3.75 text-muted">
        <Link to="/" className="transition hover:text-white">
          Trang chủ
        </Link>
        <ChevronRight size={12} strokeWidth={2} absoluteStrokeWidth />
        <span className="text-white">Lịch chiếu</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h1 className="flex items-center gap-3 font-display text-[30px] leading-9 font-bold">
          <span className="h-6 w-1 rounded-xs bg-brand" />
          Lịch chiếu
        </h1>
        {updatedAt && (
          <span className="text-xs text-muted">
            Cập nhật lúc {formatTime(updatedAt)} · {formatDate(updatedAt)}
          </span>
        )}
      </div>

      <DateTabs days={days} value={date} onChange={(day) => select('date', day)} />
      <CinemaChips cinemas={cinemas} value={cinema?.id} onChange={(id) => select('cinemaId', id)} />
      {content}
    </div>
  );
}

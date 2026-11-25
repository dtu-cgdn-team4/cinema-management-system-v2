import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { movieDetailApi } from '../api/movieDetailApi';
import { errorMessage } from '@/services/apiClient';
import SectionHeading from './SectionHeading';
import ShowtimeDatePicker from './showtimes/ShowtimeDatePicker';
import CinemaPicker from './showtimes/CinemaPicker';
import RoomShowtimes from './showtimes/RoomShowtimes';
import BookingSummary from './showtimes/BookingSummary';

function getNextSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
}

export default function ShowtimesSection({ movieId, movie }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => getNextSevenDays()[0]);
  const dates = getNextSevenDays();

  useEffect(() => {
    if (!movieId) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setSelectedSlot(null);
    movieDetailApi.getShowtimes(
      movieId,
      { date: selectedDate, city: selectedCity || undefined, cinemaId: selectedCinemaId || undefined },
      controller.signal
    )
      .then((response) => {
        setData(response);
        if (!selectedCity && response.cities?.length > 0) setSelectedCity(response.cities[0]);
      })
      .catch((requestError) => { if (!controller.signal.aborted) setError(errorMessage(requestError)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [movieId, selectedDate, selectedCity, selectedCinemaId]);

  const cinemas = data?.cinemas || [];
  const selectedCinemaName = cinemas.find((cinema) => cinema.id === selectedCinemaId)?.name ?? cinemas[0]?.name ?? '';
  const displayDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '?';

  const handleContinue = () => {
    if (!selectedSlot?.slot?.id) return;
    const previewMovie = {
      ...movie,
      genres: (movie.genres ?? []).map((genre) => (typeof genre === 'string' ? genre : genre.name)).filter(Boolean),
    };
    const previewShowtime = {
      id: selectedSlot.slot.id,
      cinemaId: selectedCinemaId ?? cinemas[0]?.id,
      startTime: selectedSlot.slot.startsAt,
      endTime: selectedSlot.slot.endsAt,
      room: { id: selectedSlot.room.id, name: selectedSlot.room.name, format: selectedSlot.room.format },
    };
    navigate(`/dat-ve/suat-chieu/${selectedSlot.slot.id}/chon-ghe`, { state: { movie: previewMovie, showtime: previewShowtime } });
  };

  return (
    <div>
      <SectionHeading>Lịch chiếu</SectionHeading>
      {loading ? (
        <div className="flex items-center justify-center py-12 sm:py-16 gap-2.5 sm:gap-3 text-slate-400">
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-brand" />
          <span className="text-xs sm:text-sm">Đang tải lịch chiếu...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
          <div className="flex-1 min-w-0 w-full space-y-3.5 sm:space-y-4">
            <ShowtimeDatePicker
              dates={dates}
              selectedDate={selectedDate}
              onSelectDate={(date) => { setSelectedDate(date); setSelectedSlot(null); }}
            />
            <CinemaPicker
              data={data}
              cinemas={cinemas}
              selectedCity={selectedCity}
              selectedCinemaId={selectedCinemaId}
              onCityChange={(city) => { setSelectedCity(city); setSelectedCinemaId(null); setSelectedSlot(null); }}
              onCinemaSelect={(cinemaId) => { setSelectedCinemaId(cinemaId); setSelectedSlot(null); }}
            />
            <RoomShowtimes
              rooms={data?.rooms || []}
              selectedCinemaName={selectedCinemaName}
              selectedSlot={selectedSlot}
              onSelectSlot={(room, slot) => { if (!slot.soldOut) setSelectedSlot({ room, slot }); }}
            />
          </div>
          <BookingSummary
            movie={movie}
            selectedSlot={selectedSlot}
            selectedCinemaName={selectedCinemaName}
            selectedDate={selectedDate}
            displayDate={displayDate}
            onContinue={handleContinue}
          />
        </div>
      )}
    </div>
  );
}

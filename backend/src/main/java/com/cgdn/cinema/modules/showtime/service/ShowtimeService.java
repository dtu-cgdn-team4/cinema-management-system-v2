package com.cgdn.cinema.modules.showtime.service;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.common.enums.SeatType;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.booking.service.SeatOccupancyService;
import com.cgdn.cinema.modules.movie.service.MovieService;
import com.cgdn.cinema.modules.pricing.service.PricingService;
import com.cgdn.cinema.modules.room.service.RoomService;
import com.cgdn.cinema.modules.showtime.dto.response.ShowtimeResponse;
import com.cgdn.cinema.modules.showtime.entity.Showtime;
import com.cgdn.cinema.modules.showtime.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieService movieService;
    private final RoomService roomService;
    private final PricingService pricingService;
    private final SeatOccupancyService seatOccupancyService;
    private final Clock clock;

    /** Suất chưa bắt đầu của một phim đang chiếu, sắp theo giờ (SRS 6.2.1); cinemaId, date có thể null. */
    public List<ShowtimeResponse> getUpcomingShowtimes(Long movieId, Long cinemaId, LocalDate date) {
        int duration = movieService.getShowingMovie(movieId).getDuration();
        // ponytail: lọc rạp, ngày trong bộ nhớ; đẩy xuống SQL nếu một phim có hàng nghìn suất sắp chiếu
        List<Showtime> showtimes = showtimeRepository
                .findUpcomingByMovie(movieId, LocalDateTime.now(clock), AppConstants.STATUS_ACTIVE).stream()
                .filter(s -> cinemaId == null || cinemaId.equals(s.getRoom().getCinema().getId()))
                .filter(s -> date == null || date.equals(s.getStartTime().toLocalDate()))
                .toList();
        return toResponses(showtimes, duration);
    }

    /** Một suất chưa bắt đầu, không có thì ném SHOWTIME_NOT_FOUND. */
    public ShowtimeResponse getUpcomingShowtime(Long id) {
        Showtime showtime = showtimeRepository.findUpcomingById(id, LocalDateTime.now(clock), AppConstants.STATUS_ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHOWTIME_NOT_FOUND));
        int duration = movieService.getMovie(showtime.getMovieId()).duration();
        return toResponses(List.of(showtime), duration).get(0);
    }

    private List<ShowtimeResponse> toResponses(List<Showtime> showtimes, int duration) {
        Map<Long, Integer> seatsByRoom = roomService.countSeatsByRoom(
                showtimes.stream().map(s -> s.getRoom().getId()).distinct().toList());
        Map<Long, Integer> takenByShowtime = seatOccupancyService.countTakenSeats(
                showtimes.stream().map(Showtime::getId).toList());
        Map<DayOfWeek, Long> prices = pricingService.getPricesByDay(SeatType.THUONG);

        return showtimes.stream().map(s -> {
            int totalSeats = seatsByRoom.getOrDefault(s.getRoom().getId(), 0);
            return new ShowtimeResponse(
                    s.getId(),
                    s.getMovieId(),
                    s.getRoom().getCinema().getId(),
                    s.getRoom().getCinema().getName(),
                    s.getStartTime(),
                    s.getStartTime().plusMinutes(duration),
                    new ShowtimeResponse.RoomInfo(s.getRoom().getId(), s.getRoom().getName(), totalSeats),
                    totalSeats - takenByShowtime.getOrDefault(s.getId(), 0),
                    prices.get(s.getStartTime().getDayOfWeek()));
        }).toList();
    }
}

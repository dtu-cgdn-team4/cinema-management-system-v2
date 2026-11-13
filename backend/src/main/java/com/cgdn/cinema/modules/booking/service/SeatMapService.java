package com.cgdn.cinema.modules.booking.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.modules.booking.dto.response.SeatMapResponse;
import com.cgdn.cinema.modules.booking.dto.response.SeatMapResponse.Availability;
import com.cgdn.cinema.modules.booking.entity.SeatHold;
import com.cgdn.cinema.modules.booking.repository.SeatHoldRepository;
import com.cgdn.cinema.modules.movie.service.MovieService;
import com.cgdn.cinema.modules.pricing.service.PricingService;
import com.cgdn.cinema.modules.room.entity.Seat;
import com.cgdn.cinema.modules.room.service.RoomService;
import com.cgdn.cinema.modules.showtime.dto.response.ShowtimeResponse;
import com.cgdn.cinema.modules.showtime.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Sơ đồ ghế của một suất chiếu, bước 1 của "Luồng đặt vé online" trong architecture.md. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeatMapService {

    private final SeatHoldRepository seatHoldRepository;
    private final ShowtimeService showtimeService;
    private final MovieService movieService;
    private final RoomService roomService;
    private final PricingService pricingService;
    private final Clock clock;

    public SeatMapResponse getSeatMap(Long showtimeId) {
        ShowtimeResponse showtime = showtimeService.getUpcomingShowtime(showtimeId);
        Set<Long> taken = seatHoldRepository.findActive(showtimeId, LocalDateTime.now(clock)).stream()
                .map(SeatHold::getSeatId)
                .collect(Collectors.toSet());

        Map<String, List<SeatMapResponse.Cell>> rows = new LinkedHashMap<>();
        for (Seat seat : roomService.getSeats(showtime.room().id())) {
            Availability status = taken.contains(seat.getId()) ? Availability.TAKEN : Availability.AVAILABLE;
            rows.computeIfAbsent(seat.getRowName(), k -> new ArrayList<>())
                    .add(new SeatMapResponse.Cell(seat.getId(), seat.getLabel(), seat.getNumber(), seat.getGridColumn(),
                            seat.getType(), status));
        }

        return new SeatMapResponse(
                movieService.getMovie(showtime.movieId()),
                showtime,
                pricingService.getPricesForDay(showtime.startTime().getDayOfWeek()),
                AppConstants.MAX_SEATS_PER_BOOKING,
                rows.entrySet().stream().map(e -> new SeatMapResponse.Row(e.getKey(), e.getValue())).toList());
    }
}

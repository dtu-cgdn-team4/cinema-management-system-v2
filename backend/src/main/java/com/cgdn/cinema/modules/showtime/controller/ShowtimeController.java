package com.cgdn.cinema.modules.showtime.controller;

import java.time.LocalDate;
import java.util.List;
import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.modules.showtime.dto.response.ShowtimeResponse;
import com.cgdn.cinema.modules.showtime.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    /** Suất chiếu sắp tới của một phim đang chiếu, lọc theo rạp và ngày; phim không đang chiếu trả 404 MOVIE_NOT_FOUND. */
    @GetMapping("/api/v1/movies/{movieId}/showtimes")
    public ApiResponse<List<ShowtimeResponse>> getShowtimes(
            @PathVariable Long movieId,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.ok(showtimeService.getUpcomingShowtimes(movieId, cinemaId, date));
    }
}

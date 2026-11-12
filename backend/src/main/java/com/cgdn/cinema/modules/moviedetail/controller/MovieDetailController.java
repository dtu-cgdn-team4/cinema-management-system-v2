package com.cgdn.cinema.modules.moviedetail.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieDetailResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieShowtimesResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieSummaryResponse;
import com.cgdn.cinema.modules.moviedetail.service.MovieDetailService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MovieDetailController {

    private final MovieDetailService movieDetailService;

    @GetMapping("/api/movies/{movieId}")
    @Operation(summary = "Lấy chi tiết phim và các suất chiếu chưa bắt đầu")
    public ApiResponse<MovieDetailResponse> getMovieDetail(
            @PathVariable("movieId") @Positive Long movieId) {
        return ApiResponse.success(movieDetailService.getMovieDetail(movieId));
    }

    @GetMapping("/api/movies/{movieId}/showtimes")
    @Operation(summary = "Lịch chiếu theo ngày, khu vực, rạp; giá vé và số ghế còn trống theo phòng")
    public ApiResponse<MovieShowtimesResponse> getShowtimes(
            @PathVariable("movieId") @Positive Long movieId,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(name = "city", required = false) @Size(max = 100) String city,
            @RequestParam(name = "cinemaId", required = false) @Positive Long cinemaId) {
        return ApiResponse.success(movieDetailService.getShowtimes(movieId, date, city, cinemaId));
    }

    @GetMapping("/api/movies/{movieId}/related")
    @Operation(summary = "Phim liên quan, ưu tiên số thể loại chung rồi ngày khởi chiếu mới nhất")
    public ApiResponse<List<MovieSummaryResponse>> getRelatedMovies(
            @PathVariable("movieId") @Positive Long movieId,
            @RequestParam(name = "limit", defaultValue = "4") @Min(1) @Max(20) int limit) {
        return ApiResponse.success(movieDetailService.getRelatedMovies(movieId, limit));
    }
}

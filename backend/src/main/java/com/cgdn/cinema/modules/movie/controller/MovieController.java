package com.cgdn.cinema.modules.movie.controller;

import java.util.List;
import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.common.response.PageResponse;
import com.cgdn.cinema.modules.movie.dto.response.GenreResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieListResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
import com.cgdn.cinema.modules.movie.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
public class MovieController {

    public enum MovieStatus { SHOWING }

    private final MovieService movieService;

    /** Danh sách phim theo trạng thái; hiện chỉ có SHOWING (phim đang chiếu). */
    @GetMapping
    public ApiResponse<List<MovieResponse>> getMovies(
            @RequestParam(defaultValue = "SHOWING") MovieStatus status) {
        return ApiResponse.success(movieService.getShowingMovies());
    }

    @GetMapping("/now-showing")
    public ApiResponse<PageResponse<MovieListResponse>> getNowShowing(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long genreId) {
        return ApiResponse.success("Lấy danh sách phim đang chiếu thành công",
                PageResponse.from(movieService.getNowShowingMovies(page, size, genreId)));
    }

    @GetMapping("/coming-soon")
    public ApiResponse<PageResponse<MovieListResponse>> getComingSoon(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long genreId) {
        return ApiResponse.success("Lấy danh sách phim sắp chiếu thành công",
                PageResponse.from(movieService.getComingSoonMovies(page, size, genreId)));
    }

    @GetMapping("/genres")
    public ApiResponse<List<GenreResponse>> getAllGenres() {
        return ApiResponse.success("Lấy danh sách thể loại thành công", movieService.getAllGenres());
    }
}

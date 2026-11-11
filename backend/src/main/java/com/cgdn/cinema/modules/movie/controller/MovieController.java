package com.cgdn.cinema.modules.movie.controller;

import java.util.List;
import com.cgdn.cinema.common.response.ApiResponse;
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
        return ApiResponse.ok(movieService.getShowingMovies());
    }
}

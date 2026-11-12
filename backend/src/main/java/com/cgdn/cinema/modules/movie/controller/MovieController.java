package com.cgdn.cinema.modules.movie.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.common.response.PageResponse;
import com.cgdn.cinema.modules.movie.dto.response.GenreResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieDetailResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
import com.cgdn.cinema.modules.movie.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API công khai cho module phim – không yêu cầu đăng nhập.
 *
 * <ul>
 *   <li>GET /api/movies/now-showing   – Danh sách phim đang chiếu</li>
 *   <li>GET /api/movies/coming-soon   – Danh sách phim sắp chiếu</li>
 *   <li>GET /api/movies/{id}          – Chi tiết phim</li>
 *   <li>GET /api/movies/genres        – Danh sách thể loại</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    // Danh sách phim đang chiếu 

    @GetMapping("/now-showing")
    public ResponseEntity<ApiResponse<PageResponse<MovieResponse>>> getNowShowing(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long genreId
    ) {
        Page<MovieResponse> result = movieService.getNowShowingMovies(page, size, genreId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim đang chiếu thành công", PageResponse.from(result)));
    }

    // Danh sách phim sắp chiếu

    @GetMapping("/coming-soon")
    public ResponseEntity<ApiResponse<PageResponse<MovieResponse>>> getComingSoon(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long genreId
    ) {
        Page<MovieResponse> result = movieService.getComingSoonMovies(page, size, genreId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim sắp chiếu thành công", PageResponse.from(result)));
    }

    // Chi tiết phim

    @GetMapping("/{movieId}")
    public ResponseEntity<ApiResponse<MovieDetailResponse>> getDetail(@PathVariable("movieId") Long id) {
        MovieDetailResponse result = movieService.getMovieDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết phim thành công", result));
    }

    // Danh sách thể loại

    @GetMapping("/genres")
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getAllGenres() {
        List<GenreResponse> result = movieService.getAllGenres();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thể loại thành công", result));
    }

}

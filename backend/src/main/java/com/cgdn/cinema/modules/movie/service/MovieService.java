package com.cgdn.cinema.modules.movie.service;

import com.cgdn.cinema.modules.movie.dto.response.GenreResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieDetailResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Service interface cho module phim.
 */
public interface MovieService {

    /**
     * Danh sách phim đang chiếu, phân trang, lọc theo thể loại.
     */
    Page<MovieResponse> getNowShowingMovies(int page, int size, Long genreId);

    /**
     * Danh sách phim sắp chiếu, phân trang, lọc theo thể loại.
     */
    Page<MovieResponse> getComingSoonMovies(int page, int size, Long genreId);

    /**
     * Chi tiết một bộ phim theo id.
     */
    MovieDetailResponse getMovieDetail(Long id);

    /**
     * Lấy toàn bộ thể loại (dùng cho bộ lọc dropdown trên frontend).
     */
    List<GenreResponse> getAllGenres();
}

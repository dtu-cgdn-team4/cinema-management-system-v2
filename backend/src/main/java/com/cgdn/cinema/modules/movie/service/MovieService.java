package com.cgdn.cinema.modules.movie.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieListResponse;
import com.cgdn.cinema.modules.movie.dto.response.GenreResponse;
import com.cgdn.cinema.modules.movie.entity.Movie;
import com.cgdn.cinema.modules.movie.mapper.MovieMapper;
import com.cgdn.cinema.modules.movie.repository.MovieRepository;
import com.cgdn.cinema.modules.movie.repository.GenreRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final Clock clock;

    /** Phim đang chiếu: hôm nay nằm trong [ngày khởi chiếu, ngày kết thúc] (Q&A #38). */
    public List<MovieResponse> getShowingMovies() {
        return movieRepository.findShowing(LocalDate.now(clock), AppConstants.STATUS_ACTIVE).stream()
                .map(MovieMapper::toResponse)
                .toList();
    }

    /** Phim đang chiếu theo id, không có thì ném MOVIE_NOT_FOUND. */
    public Movie getShowingMovie(Long id) {
        return movieRepository.findShowingById(id, LocalDate.now(clock), AppConstants.STATUS_ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.MOVIE_NOT_FOUND));
    }

    public Page<MovieListResponse> getNowShowingMovies(int page, int size, Long genreId) {
        validatePage(page);
        var pageable = PageRequest.of(page, clampSize(size),
                Sort.by(Sort.Direction.DESC, "releaseDate").and(Sort.by("id")));
        return movieRepository.findNowShowing(LocalDate.now(clock), genreId, pageable)
                .map(MovieMapper::toMovieListResponse);
    }

    public Page<MovieListResponse> getComingSoonMovies(int page, int size, Long genreId) {
        validatePage(page);
        var pageable = PageRequest.of(page, clampSize(size),
                Sort.by(Sort.Direction.ASC, "releaseDate").and(Sort.by("id")));
        return movieRepository.findComingSoon(LocalDate.now(clock), genreId, pageable)
                .map(MovieMapper::toMovieListResponse);
    }

    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAllOrderByTen().stream()
                .map(MovieMapper::toGenreResponse).toList();
    }

    private int clampSize(int size) {
        return size < 1 ? 10 : Math.min(size, 100);
    }

    private void validatePage(int page) {
        if (page < 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Số trang phải lớn hơn hoặc bằng 0");
        }
    }
}

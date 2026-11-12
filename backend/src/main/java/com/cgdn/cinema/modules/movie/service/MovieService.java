package com.cgdn.cinema.modules.movie.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
import com.cgdn.cinema.modules.movie.entity.Movie;
import com.cgdn.cinema.modules.movie.mapper.MovieMapper;
import com.cgdn.cinema.modules.movie.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieService {

    private final MovieRepository movieRepository;
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

    /** Phim theo id, không xét ngày chiếu (dùng khi đã có suất chiếu hợp lệ). */
    public MovieResponse getMovie(Long id) {
        return movieRepository.findById(id)
                .map(MovieMapper::toResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.MOVIE_NOT_FOUND));
    }
}

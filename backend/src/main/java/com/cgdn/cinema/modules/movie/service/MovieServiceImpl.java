package com.cgdn.cinema.modules.movie.service;

import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.movie.dto.response.GenreResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieDetailResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
import com.cgdn.cinema.modules.movie.mapper.MovieMapper;
import com.cgdn.cinema.modules.movie.repository.GenreRepository;
import com.cgdn.cinema.modules.movie.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * Triển khai nghiệp vụ module phim.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final MovieMapper movieMapper;

    @Override
    public Page<MovieResponse> getNowShowingMovies(int page, int size, Long genreId) {
        Pageable pageable = PageRequest.of(page, clampSize(size),
                Sort.by(Sort.Direction.DESC, "ngayKhoiChieu").and(Sort.by("id")));
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        return movieRepository
                .findNowShowing(today, genreId, pageable)
                .map(movieMapper::toMovieResponse);
    }

    @Override
    public Page<MovieResponse> getComingSoonMovies(int page, int size, Long genreId) {
        Pageable pageable = PageRequest.of(page, clampSize(size),
                Sort.by(Sort.Direction.ASC, "ngayKhoiChieu").and(Sort.by("id")));
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        return movieRepository
                .findComingSoon(today, genreId, pageable)
                .map(movieMapper::toMovieResponse);
    }

    @Override
    public MovieDetailResponse getMovieDetail(Long id) {
        return movieRepository.findActiveById(id)
                .map(movieMapper::toMovieDetailResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.MOVIE_NOT_FOUND));
    }

    @Override
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAllOrderByTen().stream()
                .map(movieMapper::toGenreResponse)
                .toList();
    }

    // Helpers

    private int clampSize(int size) {
        if (size < 1) return AppConstants.DEFAULT_PAGE_SIZE;
        return Math.min(size, AppConstants.MAX_PAGE_SIZE);
    }

}

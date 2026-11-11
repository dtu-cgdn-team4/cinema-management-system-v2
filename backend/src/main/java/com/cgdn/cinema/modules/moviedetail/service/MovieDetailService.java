package com.cgdn.cinema.modules.moviedetail.service;

import com.cgdn.cinema.modules.moviedetail.dto.response.MovieDetailResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieShowtimesResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieShowtimesResponse.CinemaResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieSummaryResponse;
import com.cgdn.cinema.modules.moviedetail.entity.MovieDetailEntity;
import com.cgdn.cinema.modules.moviedetail.exception.MovieDetailNotFoundException;
import com.cgdn.cinema.modules.moviedetail.mapper.MovieDetailMapper;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailRepository;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailAvailabilityProjection;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailPriceProjection;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailShowtimeProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieDetailService {

    private static final ZoneId CINEMA_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final MovieDetailRepository movieDetailRepository;
    private final MovieDetailMapper movieDetailMapper;

    public MovieDetailResponse getMovieDetail(Long movieId) {
        MovieDetailEntity movie = requireMovie(movieId);
        LocalDateTime now = LocalDateTime.now(CINEMA_ZONE);
        return movieDetailMapper.toResponse(movie, movieDetailRepository.findUpcomingShowtimes(
                movieId, now), now.toLocalDate());
    }

    public MovieShowtimesResponse getShowtimes(Long movieId, LocalDate date, String city, Long cinemaId) {
        MovieDetailEntity movie = requireMovie(movieId);
        LocalDateTime now = LocalDateTime.now(CINEMA_ZONE);
        LocalDate selectedDate = date == null ? now.toLocalDate() : date;
        if (selectedDate.getYear() < 1000 || selectedDate.getYear() > 9999) {
            throw new DateTimeException("Ngày nằm ngoài phạm vi DATE của MySQL.");
        }
        String selectedCity = city == null || city.isBlank() ? null : city.strip();
        List<MovieDetailShowtimeProjection> upcoming = movieDetailRepository.findUpcomingShowtimes(movieId, now);
        List<MovieDetailShowtimeProjection> cityShowtimes = upcoming.stream()
                .filter(showtime -> selectedCity == null || selectedCity.equals(showtime.getCinemaCity()))
                .toList();
        List<CinemaResponse> cinemas = movieDetailMapper.toCinemas(cityShowtimes.stream()
                .filter(showtime -> selectedDate.equals(showtime.getStartsAt().toLocalDate())).toList());
        Long selectedCinema = cinemaId != null ? cinemaId : cinemas.stream()
                .map(CinemaResponse::getId).findFirst().orElse(null);
        boolean cinemaAvailable = cinemas.stream().anyMatch(cinema -> cinema.getId().equals(selectedCinema));

        List<MovieDetailAvailabilityProjection> slots = cinemaAvailable
                ? movieDetailRepository.findShowtimeAvailability(movieId, selectedCinema,
                        selectedDate.atStartOfDay(), selectedDate.plusDays(1).atStartOfDay(), now)
                : List.of();
        List<Long> roomIds = slots.stream().map(MovieDetailAvailabilityProjection::getRoomId).distinct().toList();
        List<MovieDetailPriceProjection> prices = roomIds.isEmpty() ? List.of()
                : movieDetailRepository.findRoomPrices(roomIds, selectedDate.getDayOfWeek().getValue());

        return MovieShowtimesResponse.builder()
                .movieId(movieId).date(selectedDate).city(selectedCity).cinemaId(selectedCinema).currency("VND")
                .availableDates(cityShowtimes.stream().map(showtime -> showtime.getStartsAt().toLocalDate())
                        .distinct().sorted().toList())
                .cities(upcoming.stream().map(MovieDetailShowtimeProjection::getCinemaCity)
                        .filter(Objects::nonNull).distinct().sorted().toList())
                .cinemas(cinemas).rooms(movieDetailMapper.toRooms(movie, slots, prices))
                .build();
    }

    public List<MovieSummaryResponse> getRelatedMovies(Long movieId, int limit) {
        requireMovie(movieId);
        LocalDate today = LocalDate.now(CINEMA_ZONE);
        List<Long> ids = movieDetailRepository.findRelatedMovieIds(movieId, today, PageRequest.of(0, limit));
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, MovieDetailEntity> movies = movieDetailRepository.findVisibleByIds(ids).stream()
                .collect(Collectors.toMap(MovieDetailEntity::getId, Function.identity()));
        return ids.stream().map(movies::get).filter(Objects::nonNull)
                .map(movie -> movieDetailMapper.toSummary(movie, today)).toList();
    }

    private MovieDetailEntity requireMovie(Long movieId) {
        return movieDetailRepository.findVisibleById(movieId)
                .orElseThrow(() -> new MovieDetailNotFoundException(movieId));
    }
}

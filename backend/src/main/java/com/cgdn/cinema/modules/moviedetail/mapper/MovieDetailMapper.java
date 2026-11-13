package com.cgdn.cinema.modules.moviedetail.mapper;

import com.cgdn.cinema.modules.moviedetail.dto.response.MovieDetailResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieDetailResponse.GenreResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieDetailResponse.ShowtimeResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieScreeningStatus;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieShowtimesResponse.CinemaResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieShowtimesResponse.RoomResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieShowtimesResponse.SeatPriceResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieShowtimesResponse.SlotResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieSummaryResponse;
import com.cgdn.cinema.modules.moviedetail.entity.MovieDetailEntity;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailAvailabilityProjection;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailPriceProjection;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailShowtimeProjection;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class MovieDetailMapper {

    private static final String SCREENING_FORMAT = "2D";

    public MovieDetailResponse toResponse(MovieDetailEntity movie,
                                         List<MovieDetailShowtimeProjection> showtimes, LocalDate today) {
        return MovieDetailResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .galleryImages(List.of())
                .director(movie.getDirector())
                .actors(toActors(movie.getActors()))
                .genres(toGenres(movie))
                .duration(movie.getDuration())
                .releaseDate(movie.getReleaseDate())
                .endDate(movie.getEndDate())
                .productionCompany(movie.getProductionCompany())
                .screeningStatus(toScreeningStatus(movie, today))
                .format(SCREENING_FORMAT)
                .ageRating(movie.getAgeRating())
                .description(movie.getDescription())
                .trailerUrl(movie.getTrailerUrl())
                .status(movie.getStatus())
                .showtimes(showtimes == null ? List.of() : showtimes.stream()
                        .filter(Objects::nonNull)
                        .map(showtime -> toShowtime(showtime, movie.getDuration()))
                        .toList())
                .build();
    }

    public MovieSummaryResponse toSummary(MovieDetailEntity movie, LocalDate today) {
        return MovieSummaryResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .trailerUrl(movie.getTrailerUrl())
                .ageRating(movie.getAgeRating())
                .duration(movie.getDuration())
                .format(SCREENING_FORMAT)
                .screeningStatus(toScreeningStatus(movie, today))
                .genres(toGenres(movie))
                .build();
    }

    public List<CinemaResponse> toCinemas(List<MovieDetailShowtimeProjection> showtimes) {
        Map<Long, CinemaResponse> cinemas = new LinkedHashMap<>();
        for (MovieDetailShowtimeProjection showtime : showtimes) {
            cinemas.putIfAbsent(showtime.getCinemaId(), CinemaResponse.builder()
                    .id(showtime.getCinemaId()).name(showtime.getCinemaName())
                    .city(showtime.getCinemaCity()).address(showtime.getCinemaAddress()).build());
        }
        return cinemas.values().stream()
                .sorted(Comparator.comparing(CinemaResponse::getName,
                        Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(CinemaResponse::getId))
                .toList();
    }

    public List<RoomResponse> toRooms(MovieDetailEntity movie,
                                     List<MovieDetailAvailabilityProjection> showtimes,
                                     List<MovieDetailPriceProjection> prices) {
        Map<Long, List<MovieDetailAvailabilityProjection>> rooms = showtimes.stream()
                .collect(Collectors.groupingBy(MovieDetailAvailabilityProjection::getRoomId,
                        LinkedHashMap::new, Collectors.toList()));
        Map<Long, List<MovieDetailPriceProjection>> roomPrices = prices.stream()
                .collect(Collectors.groupingBy(MovieDetailPriceProjection::getRoomId));

        return rooms.entrySet().stream().map(entry -> RoomResponse.builder()
                .id(entry.getKey())
                .name(entry.getValue().get(0).getRoomName())
                .format(SCREENING_FORMAT)
                .prices(roomPrices.getOrDefault(entry.getKey(), List.of()).stream()
                        .map(price -> SeatPriceResponse.builder()
                                .seatType(price.getSeatType()).amount(price.getAmount()).build())
                        .toList())
                .showtimes(entry.getValue().stream()
                        .map(showtime -> toSlot(showtime, movie.getDuration())).toList())
                .build()).toList();
    }

    private List<GenreResponse> toGenres(MovieDetailEntity movie) {
        return movie.getGenres() == null ? List.of() : movie.getGenres().stream()
                .filter(Objects::nonNull)
                .map(genre -> GenreResponse.builder().id(genre.getId()).name(genre.getName()).build())
                .toList();
    }

    private MovieScreeningStatus toScreeningStatus(MovieDetailEntity movie, LocalDate today) {
        if (movie.getReleaseDate() == null || movie.getEndDate() == null
                || movie.getEndDate().isBefore(movie.getReleaseDate())) {
            return null;
        }
        if (today.isBefore(movie.getReleaseDate())) {
            return MovieScreeningStatus.UPCOMING;
        }
        return today.isAfter(movie.getEndDate()) ? MovieScreeningStatus.ENDED : MovieScreeningStatus.NOW_SHOWING;
    }

    private List<String> toActors(String actors) {
        if (actors == null || actors.isBlank()) {
            return List.of();
        }
        return Arrays.stream(actors.split(","))
                .map(String::trim)
                .filter(actor -> !actor.isEmpty())
                .toList();
    }

    private ShowtimeResponse toShowtime(MovieDetailShowtimeProjection showtime, Integer duration) {
        return ShowtimeResponse.builder()
                .id(showtime.getId())
                .roomId(showtime.getRoomId())
                .roomName(showtime.getRoomName())
                .cinemaId(showtime.getCinemaId())
                .cinemaName(showtime.getCinemaName())
                .cinemaCity(showtime.getCinemaCity())
                .cinemaAddress(showtime.getCinemaAddress())
                .startsAt(showtime.getStartsAt())
                .endsAt(showtime.getEndsAt())
                .movieEndsAt(toMovieEndsAt(showtime.getStartsAt(), duration))
                .build();
    }

    private SlotResponse toSlot(MovieDetailAvailabilityProjection showtime, Integer duration) {
        long total = showtime.getTotalSeats() == null ? 0 : Math.max(0, showtime.getTotalSeats());
        long occupied = showtime.getOccupiedSeats() == null ? 0 : Math.max(0, showtime.getOccupiedSeats());
        long available = Math.max(0, total - occupied);
        return SlotResponse.builder()
                .id(showtime.getId()).startsAt(showtime.getStartsAt()).endsAt(showtime.getEndsAt())
                .movieEndsAt(toMovieEndsAt(showtime.getStartsAt(), duration))
                .totalSeats(total).availableSeats(available).soldOut(available == 0)
                .build();
    }

    private LocalDateTime toMovieEndsAt(LocalDateTime startsAt, Integer duration) {
        return startsAt == null || duration == null || duration <= 0 ? null : startsAt.plusMinutes(duration);
    }
}

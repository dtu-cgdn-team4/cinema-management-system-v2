package com.cgdn.cinema.modules.moviedetail.mapper;

import com.cgdn.cinema.modules.moviedetail.dto.response.MovieDetailResponse;
import com.cgdn.cinema.modules.moviedetail.dto.response.MovieScreeningStatus;
import com.cgdn.cinema.modules.moviedetail.entity.MovieDetailEntity;
import com.cgdn.cinema.modules.moviedetail.entity.MovieDetailGenreEntity;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailShowtimeProjection;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MovieDetailMapperTest {

    private final MovieDetailMapper mapper = new MovieDetailMapper();

    @Test
    void mapsAllMovieGenreAndShowtimeFields() {
        MovieDetailEntity movie = new MovieDetailEntity();
        movie.setId(7L);
        movie.setTitle("Phim kiểm thử");
        movie.setPosterUrl("https://cinema.example/poster.jpg");
        movie.setDirector("Đạo diễn");
        movie.setActors(" Diễn viên A, , Diễn viên B, ");
        movie.setDuration(120);
        movie.setReleaseDate(LocalDate.of(2026, 11, 1));
        movie.setEndDate(LocalDate.of(2026, 12, 1));
        movie.setProductionCompany("Hãng phim");
        movie.setAgeRating("T16");
        movie.setDescription("Nội dung phim");
        movie.setTrailerUrl("https://www.youtube.com/watch?v=test");
        movie.setStatus((byte) 1);

        MovieDetailGenreEntity genre = new MovieDetailGenreEntity();
        genre.setId(3L);
        genre.setName("Hành động");
        movie.setGenres(List.of(genre));

        MovieDetailShowtimeProjection showtime = mock(MovieDetailShowtimeProjection.class);
        LocalDateTime startsAt = LocalDateTime.of(2026, 11, 12, 18, 0);
        when(showtime.getId()).thenReturn(8L);
        when(showtime.getRoomId()).thenReturn(9L);
        when(showtime.getRoomName()).thenReturn("Phòng 1");
        when(showtime.getCinemaId()).thenReturn(10L);
        when(showtime.getCinemaName()).thenReturn("Rạp 1");
        when(showtime.getStartsAt()).thenReturn(startsAt);
        when(showtime.getEndsAt()).thenReturn(startsAt.plusMinutes(135));

        MovieDetailResponse response = mapper.toResponse(movie, List.of(showtime), LocalDate.of(2026, 11, 11));

        assertThat(response.getId()).isEqualTo(7L);
        assertThat(response.getTitle()).isEqualTo(movie.getTitle());
        assertThat(response.getPosterUrl()).isEqualTo(movie.getPosterUrl());
        assertThat(response.getDirector()).isEqualTo(movie.getDirector());
        assertThat(response.getActors()).containsExactly("Diễn viên A", "Diễn viên B");
        assertThat(response.getDuration()).isEqualTo(120);
        assertThat(response.getReleaseDate()).isEqualTo(movie.getReleaseDate());
        assertThat(response.getEndDate()).isEqualTo(movie.getEndDate());
        assertThat(response.getProductionCompany()).isEqualTo("Hãng phim");
        assertThat(response.getScreeningStatus()).isEqualTo(MovieScreeningStatus.NOW_SHOWING);
        assertThat(response.getFormat()).isEqualTo("2D");
        assertThat(response.getAgeRating()).isEqualTo("T16");
        assertThat(response.getDescription()).isEqualTo(movie.getDescription());
        assertThat(response.getTrailerUrl()).isEqualTo(movie.getTrailerUrl());
        assertThat(response.getStatus()).isEqualTo((byte) 1);
        assertThat(response.getGenres()).containsExactly(MovieDetailResponse.GenreResponse.builder()
                .id(3L).name("Hành động").build());
        assertThat(response.getShowtimes()).containsExactly(MovieDetailResponse.ShowtimeResponse.builder()
                .id(8L).roomId(9L).roomName("Phòng 1").cinemaId(10L).cinemaName("Rạp 1")
                .startsAt(startsAt).endsAt(startsAt.plusMinutes(135)).movieEndsAt(startsAt.plusMinutes(120)).build());
    }

    @Test
    void preservesNullScalarFieldsAndReturnsEmptyListsForNullRelationships() {
        MovieDetailEntity movie = new MovieDetailEntity();
        movie.setGenres(null);

        MovieDetailResponse response = mapper.toResponse(movie, null, LocalDate.of(2026, 11, 11));

        assertThat(response).extracting(
                MovieDetailResponse::getId, MovieDetailResponse::getTitle,
                MovieDetailResponse::getPosterUrl, MovieDetailResponse::getDirector,
                MovieDetailResponse::getDuration, MovieDetailResponse::getReleaseDate,
                MovieDetailResponse::getAgeRating, MovieDetailResponse::getDescription,
                MovieDetailResponse::getTrailerUrl, MovieDetailResponse::getStatus)
                .containsOnlyNulls();
        assertThat(response.getActors()).isEmpty();
        assertThat(response.getGenres()).isEmpty();
        assertThat(response.getShowtimes()).isEmpty();
        assertThat(response.getGalleryImages()).isEmpty();
        assertThat(response.getOriginalTitle()).isNull();
        assertThat(response.getBackdropUrl()).isNull();
        assertThat(response.getSubtitle()).isNull();
        assertThat(response.getScreeningStatus()).isNull();
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   ", ",, , "})
    void handlesMissingOrBlankActors(String actors) {
        MovieDetailEntity movie = new MovieDetailEntity();
        movie.setActors(actors);

        assertThat(mapper.toResponse(movie, List.of(), LocalDate.of(2026, 11, 11)).getActors()).isEmpty();
    }

    @Test
    void handlesNullRelationshipElementsAndNullableShowtimeFields() {
        MovieDetailEntity movie = new MovieDetailEntity();
        movie.setGenres(Arrays.asList((MovieDetailGenreEntity) null));
        MovieDetailShowtimeProjection showtime = mock(MovieDetailShowtimeProjection.class);
        when(showtime.getId()).thenReturn(null);

        MovieDetailResponse response = mapper.toResponse(movie, Arrays.asList(null, showtime),
                LocalDate.of(2026, 11, 11));

        assertThat(response.getGenres()).isEmpty();
        assertThat(response.getShowtimes()).singleElement().satisfies(result -> {
            assertThat(result.getId()).isNull();
            assertThat(result.getStartsAt()).isNull();
            assertThat(result.getEndsAt()).isNull();
        });
    }

    @ParameterizedTest
    @CsvSource({"2026-10-31,UPCOMING", "2026-11-01,NOW_SHOWING", "2026-11-15,NOW_SHOWING",
            "2026-11-30,NOW_SHOWING", "2026-12-01,ENDED"})
    void determinesScreeningStatusIncludingBothReleaseAndEndDates(String date, MovieScreeningStatus expected) {
        MovieDetailEntity movie = new MovieDetailEntity();
        movie.setReleaseDate(LocalDate.of(2026, 11, 1));
        movie.setEndDate(LocalDate.of(2026, 11, 30));

        assertThat(mapper.toSummary(movie, LocalDate.parse(date)).getScreeningStatus())
                .isEqualTo(expected);
    }

    @Test
    void doesNotInventScreeningStatusForInvalidDates() {
        MovieDetailEntity movie = new MovieDetailEntity();
        movie.setReleaseDate(LocalDate.of(2026, 12, 1));
        movie.setEndDate(LocalDate.of(2026, 11, 1));

        assertThat(mapper.toSummary(movie, LocalDate.of(2026, 11, 11)).getScreeningStatus()).isNull();
    }
}

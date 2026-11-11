package com.cgdn.cinema.modules.moviedetail.service;

import com.cgdn.cinema.modules.moviedetail.dto.response.MovieDetailResponse;
import com.cgdn.cinema.modules.moviedetail.entity.MovieDetailEntity;
import com.cgdn.cinema.modules.moviedetail.exception.MovieDetailNotFoundException;
import com.cgdn.cinema.modules.moviedetail.mapper.MovieDetailMapper;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailRepository;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailShowtimeProjection;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovieDetailServiceTest {

    @Mock
    private MovieDetailRepository repository;

    @Mock
    private MovieDetailMapper mapper;

    @InjectMocks
    private MovieDetailService service;

    @Test
    void returnsMappedDetailsAndQueriesShowtimesUsingCinemaTimeZone() {
        MovieDetailEntity movie = new MovieDetailEntity();
        List<MovieDetailShowtimeProjection> showtimes = List.of();
        MovieDetailResponse response = MovieDetailResponse.builder().id(7L).build();
        when(repository.findVisibleById(7L)).thenReturn(Optional.of(movie));
        when(repository.findUpcomingShowtimes(eq(7L), any(LocalDateTime.class))).thenReturn(showtimes);
        when(mapper.toResponse(eq(movie), eq(showtimes), any(LocalDate.class))).thenReturn(response);

        LocalDateTime before = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        assertThat(service.getMovieDetail(7L)).isSameAs(response);
        LocalDateTime after = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        ArgumentCaptor<LocalDateTime> cutoff = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(repository).findUpcomingShowtimes(eq(7L), cutoff.capture());
        assertThat(cutoff.getValue()).isBetween(before, after);
        verify(mapper).toResponse(movie, showtimes, cutoff.getValue().toLocalDate());
    }

    @Test
    void rejectsMissingMovieBeforeLoadingShowtimes() {
        when(repository.findVisibleById(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getMovieDetail(7L))
                .isInstanceOf(MovieDetailNotFoundException.class)
                .hasMessage("Không tìm thấy phim với ID: 7");
        verify(repository, never()).findUpcomingShowtimes(any(), any());
        verifyNoInteractions(mapper);
    }
}

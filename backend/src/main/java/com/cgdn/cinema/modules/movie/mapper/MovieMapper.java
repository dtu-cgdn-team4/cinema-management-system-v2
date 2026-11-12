package com.cgdn.cinema.modules.movie.mapper;

import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieListResponse;
import com.cgdn.cinema.modules.movie.dto.response.GenreResponse;
import java.util.Comparator;
import com.cgdn.cinema.modules.movie.entity.Genre;
import com.cgdn.cinema.modules.movie.entity.Movie;

public final class MovieMapper {

    private MovieMapper() {
    }

    public static MovieResponse toResponse(Movie m) {
        return new MovieResponse(m.getId(), m.getTitle(), m.getDuration(), m.getAgeRating(),
                m.getGenres().stream().map(Genre::getName).toList(),
                m.getReleaseDate(), m.getEndDate(), m.getPosterUrl(), m.getTrailerUrl(), m.getDescription());
    }

    public static GenreResponse toGenreResponse(Genre genre) {
        return GenreResponse.builder().id(genre.getId()).ten(genre.getName()).build();
    }

    public static MovieListResponse toMovieListResponse(Movie movie) {
        return MovieListResponse.builder()
                .id(movie.getId())
                .tenPhim(movie.getTitle())
                .thoiLuong(movie.getDuration())
                .nhanTuoi(movie.getAgeRating().name())
                .ngayKhoiChieu(movie.getReleaseDate())
                .ngayKetThuc(movie.getEndDate())
                .posterUrl(movie.getPosterUrl())
                .theLoai(movie.getGenres().stream().sorted(Comparator.comparing(Genre::getId))
                        .map(MovieMapper::toGenreResponse).toList())
                .build();
    }
}

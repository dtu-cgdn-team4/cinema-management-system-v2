package com.cgdn.cinema.modules.movie.mapper;

import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
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
}

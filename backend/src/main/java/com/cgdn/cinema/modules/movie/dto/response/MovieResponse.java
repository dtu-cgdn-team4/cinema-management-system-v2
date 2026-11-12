package com.cgdn.cinema.modules.movie.dto.response;

import java.time.LocalDate;
import java.util.List;
import com.cgdn.cinema.common.enums.AgeRating;

public record MovieResponse(
        Long id,
        String title,
        Integer duration,
        AgeRating ageRating,
        List<String> genres,
        LocalDate releaseDate,
        LocalDate endDate,
        String posterUrl,
        String trailerUrl,
        String description) {
}

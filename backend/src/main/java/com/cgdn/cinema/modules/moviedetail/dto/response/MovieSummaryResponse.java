package com.cgdn.cinema.modules.moviedetail.dto.response;

import com.cgdn.cinema.modules.moviedetail.dto.response.MovieDetailResponse.GenreResponse;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class MovieSummaryResponse {
    Long id;
    String title;
    String posterUrl;
    String trailerUrl;
    String ageRating;
    Integer duration;
    String format;
    MovieScreeningStatus screeningStatus;
    List<GenreResponse> genres;
}

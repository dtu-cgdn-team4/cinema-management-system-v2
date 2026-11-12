package com.cgdn.cinema.modules.movie.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * DTO thể loại phim – dùng lồng trong MovieResponse.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenreResponse {
    private Long id;
    private String ten;
}

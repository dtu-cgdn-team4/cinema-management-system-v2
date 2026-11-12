package com.cgdn.cinema.modules.movie.mapper;

import com.cgdn.cinema.modules.movie.dto.response.GenreResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieDetailResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
import com.cgdn.cinema.modules.movie.entity.Genre;
import com.cgdn.cinema.modules.movie.entity.Movie;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Chuyển đổi Entity → DTO cho module phim.
 */
@Component
public class MovieMapper {

    // ── Genre

    public GenreResponse toGenreResponse(Genre genre) {
        return GenreResponse.builder()
                .id(genre.getId())
                .ten(genre.getTen())
                .build();
    }

    // ── Movie → MovieResponse (danh sách) 

    public MovieResponse toMovieResponse(Movie movie) {
        return MovieResponse.builder()
                .id(movie.getId())
                .tenPhim(movie.getTenPhim())
                .thoiLuong(movie.getThoiLuong())
                .nhanTuoi(movie.getNhanTuoi())
                .ngayKhoiChieu(movie.getNgayKhoiChieu())
                .ngayKetThuc(movie.getNgayKetThuc())
                .posterUrl(movie.getPosterUrl())
                .theLoai(toGenreList(movie))
                .build();
    }

    // ── Movie → MovieDetailResponse (chi tiết)

    public MovieDetailResponse toMovieDetailResponse(Movie movie) {
        return MovieDetailResponse.builder()
                .id(movie.getId())
                .tenPhim(movie.getTenPhim())
                .thoiLuong(movie.getThoiLuong())
                .nhanTuoi(movie.getNhanTuoi())
                .ngayKhoiChieu(movie.getNgayKhoiChieu())
                .ngayKetThuc(movie.getNgayKetThuc())
                .daoDien(movie.getDaoDien())
                .dienVien(movie.getDienVien())
                .hangSanXuat(movie.getHangSanXuat())
                .trailerUrl(movie.getTrailerUrl())
                .posterUrl(movie.getPosterUrl())
                .noiDung(movie.getNoiDung())
                .theLoai(toGenreList(movie))
                .build();
    }

    // ── Helper 

    private List<GenreResponse> toGenreList(Movie movie) {
        return movie.getTheLoai().stream()
                .sorted(Comparator.comparing(Genre::getId))
                .map(this::toGenreResponse)
                .toList();
    }
}

package com.cgdn.cinema.modules.movie.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO chi tiết phim – dùng cho trang chi tiết, chứa đầy đủ thông tin.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieDetailResponse {
    private Long id;
    private String tenPhim;
    private Integer thoiLuong;
    private String nhanTuoi;
    private LocalDate ngayKhoiChieu;
    private LocalDate ngayKetThuc;
    private String daoDien;
    private String dienVien;
    private String hangSanXuat;
    private String trailerUrl;
    private String posterUrl;
    private String noiDung;
    private List<GenreResponse> theLoai;
}

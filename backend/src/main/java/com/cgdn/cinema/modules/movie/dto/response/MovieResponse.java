package com.cgdn.cinema.modules.movie.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO danh sách phim – dùng cho trang danh sách, chỉ chứa thông tin tóm tắt.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponse {
    private Long id;
    private String tenPhim;
    private Integer thoiLuong;
    private String nhanTuoi;
    private LocalDate ngayKhoiChieu;
    private LocalDate ngayKetThuc;
    private String posterUrl;
    private List<GenreResponse> theLoai;
}

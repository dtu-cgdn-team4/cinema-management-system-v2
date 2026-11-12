package com.cgdn.cinema.modules.movie.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieAdminResponse {
    private Long id;
    private String tenPhim;
    private String posterUrl;
    private List<String> theLoai;
    private Integer thoiLuong;
    private String nhanTuoi;
    private LocalDate ngayKhoiChieu;
    private LocalDate ngayKetThuc;
    private String dinhDang; // Định dạng hiển thị cố định là "2D" theo đặc tả.
    private Long tongSuatChieu;
    private String trangThaiHienThi; // Trạng thái hiển thị: DANG_CHIEU, SAP_CHIEU hoặc NGUNG_CHIEU.
    private Integer trangThai; // Trạng thái lưu: 1 là hoạt động, 2 là ngừng chiếu (xóa mềm).
}


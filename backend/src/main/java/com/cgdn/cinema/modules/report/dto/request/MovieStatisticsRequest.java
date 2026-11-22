package com.cgdn.cinema.modules.report.dto.request;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

/**
 * Tham số lọc cho báo cáo thống kê phim và doanh thu (Task 6.16.1.1).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieStatisticsRequest {

    /**
     * Chế độ lọc thời gian: NGAY (Day), TUAN (Week), THANG (Month), TUY_CHON (Custom).
     * Mặc định là THANG (theo giao diện mẫu).
     */
    private String timeType;

    /**
     * Ngày bắt đầu (định dạng YYYY-MM-DD).
     */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    /**
     * Ngày kết thúc (định dạng YYYY-MM-DD).
     */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;

    /**
     * ID rạp chiếu (null hoặc 0 là tất cả rạp).
     */
    private Long cinemaId;

    /**
     * ID phim (null hoặc 0 là tất cả phim).
     */
    private Long movieId;
}

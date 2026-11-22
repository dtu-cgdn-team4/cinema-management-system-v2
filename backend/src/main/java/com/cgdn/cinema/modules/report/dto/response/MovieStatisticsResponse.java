package com.cgdn.cinema.modules.report.dto.response;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Toàn bộ dữ liệu hiển thị cho màn hình Thống kê phim (Task 6.16.1.1):
 * - 4 Thẻ chỉ số tổng quan (Overview Summary Cards)
 * - Biểu đồ Top 5 phim theo doanh thu thuần (Horizontal Bar Chart)
 * - Biểu đồ Top 5 phim theo số vé bán (Horizontal Bar Chart)
 * - Bảng hiệu quả kinh doanh theo phim (Performance Table)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieStatisticsResponse {

    /**
     * Khối 4 thẻ chỉ số tổng quan ở đầu trang
     */
    private SummaryCard summary;

    /**
     * Top 5 phim theo doanh thu thuần (sau giảm giá, ưu đãi)
     */
    private List<TopRevenueMovieItem> topRevenueMovies;

    /**
     * Top 5 phim theo số vé đã bán
     */
    private List<TopTicketMovieItem> topTicketMovies;

    /**
     * Bảng danh sách hiệu quả kinh doanh theo phim
     */
    private List<MoviePerformanceItem> moviePerformances;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryCard {
        /**
         * Thẻ 1: Vé đã thanh toán (VD: 24.860)
         */
        private long totalTickets;

        /**
         * Tỷ lệ % tăng/giảm so với kỳ trước của vé đã bán (VD: 12.4%)
         * Dương là tăng (▲), âm là giảm (▼)
         */
        private Double ticketGrowthRate;

        /**
         * Thẻ 2: Doanh thu thuần (VD: 2.480.000.000 đ)
         */
        private BigDecimal netRevenue;

        /**
         * Tỷ lệ % tăng/giảm doanh thu so với kỳ trước
         */
        private Double revenueGrowthRate;

        /**
         * Thẻ 3: Số phim có vé bán ra thành công (VD: 18)
         */
        private long moviesWithSalesCount;

        /**
         * Thẻ 4: Tên phim bán được nhiều vé nhất (VD: "Mai")
         */
        private String topMovieTitle;

        /**
         * Số vé đã bán của phim top 1 (VD: 8.220)
         */
        private long topMovieTicketCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopRevenueMovieItem {
        private Long movieId;
        private String movieTitle;
        private String posterUrl;
        private BigDecimal revenue;
        /** Tỷ trọng % so với phim dẫn đầu (dùng vẽ thanh tiến trình) */
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopTicketMovieItem {
        private Long movieId;
        private String movieTitle;
        private String posterUrl;
        private long ticketCount;
        /** Tỷ trọng % so với phim dẫn đầu (dùng vẽ thanh tiến trình) */
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoviePerformanceItem {
        private Long movieId;
        private String movieTitle;
        private String posterUrl;
        /** Số vé đã bán thành công */
        private long ticketsSold;
        /** Doanh thu thuần sau trừ ưu đãi */
        private BigDecimal netRevenue;
        /** Số lượng suất chiếu tổ chức */
        private long showtimeCount;
        /** Tỷ lệ lấp đầy (ghế bán / tổng ghế của các suất) */
        private double occupancyRate;
    }
}

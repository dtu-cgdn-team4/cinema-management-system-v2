package com.cgdn.cinema.modules.report.service;

import com.cgdn.cinema.modules.report.dto.request.MovieStatisticsRequest;
import com.cgdn.cinema.modules.report.dto.response.MovieFilterOptionResponse;
import com.cgdn.cinema.modules.report.dto.response.MovieStatisticsResponse;

/**
 * Service xử lý tính toán số liệu thống kê phim và doanh thu (Task 6.16.1.1).
 */
public interface MovieReportService {

    /**
     * Lấy toàn bộ số liệu thống kê phim, bao gồm:
     * - 4 thẻ tóm tắt tổng quan (kèm tỷ lệ tăng trưởng so với kỳ trước)
     * - Top 5 phim theo doanh thu thuần
     * - Top 5 phim theo số vé đã bán
     * - Danh sách hiệu quả kinh doanh theo từng phim
     */
    MovieStatisticsResponse getMovieStatistics(MovieStatisticsRequest request);

    /**
     * Lấy danh sách rạp và phim phục vụ cho các dropdown bộ lọc
     */
    MovieFilterOptionResponse getFilterOptions();

    /**
     * Xuất dữ liệu báo cáo thống kê phim dưới dạng file CSV/Excel UTF-8
     */
    byte[] exportMovieReportCsv(MovieStatisticsRequest request);
}

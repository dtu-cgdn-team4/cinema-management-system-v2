package com.cgdn.cinema.modules.report.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.modules.report.dto.request.MovieStatisticsRequest;
import com.cgdn.cinema.modules.report.dto.response.MovieFilterOptionResponse;
import com.cgdn.cinema.modules.report.dto.response.MovieStatisticsResponse;
import com.cgdn.cinema.modules.report.service.MovieReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller cung cấp API Báo cáo & Thống kê Phim - Doanh thu (Task 6.16.1.1).
 * Dành riêng cho Quản trị viên (ADMIN).
 */
@RestController
@RequestMapping({"/api/v1/admin/reports/movies", "/api/admin/reports/movies"})
@RequiredArgsConstructor
@Tag(name = "Admin Movie Report", description = "API Thống kê phim và doanh thu dành cho Quản trị viên")
@PreAuthorize("hasRole('ADMIN')")
public class MovieReportController {

    private final MovieReportService movieReportService;

    @GetMapping
    @Operation(summary = "Lấy dữ liệu thống kê phim & doanh thu (4 thẻ chỉ số, Top 5 doanh thu, Top 5 số vé, Bảng hiệu quả)")
    public ApiResponse<MovieStatisticsResponse> getMovieStatistics(
            @RequestParam(required = false, defaultValue = "THANG") String timeType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) Long movieId
    ) {
        MovieStatisticsRequest request = MovieStatisticsRequest.builder()
                .timeType(timeType)
                .fromDate(fromDate)
                .toDate(toDate)
                .cinemaId(cinemaId)
                .movieId(movieId)
                .build();

        return ApiResponse.success("Lấy dữ liệu thống kê thành công", movieReportService.getMovieStatistics(request));
    }

    @GetMapping("/filter-options")
    @Operation(summary = "Lấy danh sách rạp và phim cho bộ lọc thống kê")
    public ApiResponse<MovieFilterOptionResponse> getFilterOptions() {
        return ApiResponse.success("Lấy tùy chọn bộ lọc thành công", movieReportService.getFilterOptions());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất dữ liệu báo cáo thống kê phim ra file Excel/CSV")
    public ResponseEntity<byte[]> exportMovieReport(
            @RequestParam(required = false, defaultValue = "THANG") String timeType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) Long movieId
    ) {
        MovieStatisticsRequest request = MovieStatisticsRequest.builder()
                .timeType(timeType)
                .fromDate(fromDate)
                .toDate(toDate)
                .cinemaId(cinemaId)
                .movieId(movieId)
                .build();

        byte[] csvData = movieReportService.exportMovieReportCsv(request);
        String filename = "ThongKePhim_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}

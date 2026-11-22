package com.cgdn.cinema.modules.report.service.impl;

import com.cgdn.cinema.modules.report.dto.request.MovieStatisticsRequest;
import com.cgdn.cinema.modules.report.dto.response.MovieFilterOptionResponse;
import com.cgdn.cinema.modules.report.dto.response.MovieFilterOptionResponse.FilterOptionItem;
import com.cgdn.cinema.modules.report.dto.response.MovieStatisticsResponse;
import com.cgdn.cinema.modules.report.dto.response.MovieStatisticsResponse.MoviePerformanceItem;
import com.cgdn.cinema.modules.report.dto.response.MovieStatisticsResponse.SummaryCard;
import com.cgdn.cinema.modules.report.dto.response.MovieStatisticsResponse.TopRevenueMovieItem;
import com.cgdn.cinema.modules.report.dto.response.MovieStatisticsResponse.TopTicketMovieItem;
import com.cgdn.cinema.modules.report.repository.MovieReportRepository;
import com.cgdn.cinema.modules.report.repository.MovieReportRepository.MoviePerformanceProjection;
import com.cgdn.cinema.modules.report.repository.MovieReportRepository.TopMovieTicketProjection;
import com.cgdn.cinema.modules.report.repository.MovieReportRepository.TopRevenueMovieProjection;
import com.cgdn.cinema.modules.report.repository.MovieReportRepository.TopTicketMovieProjection;
import com.cgdn.cinema.modules.report.service.MovieReportService;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MovieReportServiceImpl implements MovieReportService {

    private final MovieReportRepository reportRepository;

    @Override
    public MovieStatisticsResponse getMovieStatistics(MovieStatisticsRequest request) {
        // 1. Xác định khoảng thời gian kỳ hiện tại (Current Period)
        TimeRange currentRange = resolveTimeRange(request);

        // 2. Xác định khoảng thời gian kỳ trước (Previous Period) để tính tỷ lệ tăng trưởng
        long days = ChronoUnit.DAYS.between(currentRange.startDate(), currentRange.endDate()) + 1;
        LocalDate prevStartDate = currentRange.startDate().minusDays(days);
        LocalDate prevEndDate = currentRange.startDate().minusDays(1);
        LocalDateTime prevStart = prevStartDate.atStartOfDay();
        LocalDateTime prevEnd = prevEndDate.atTime(LocalTime.MAX);

        Long cinemaId = (request.getCinemaId() != null && request.getCinemaId() > 0) ? request.getCinemaId() : null;
        Long movieId = (request.getMovieId() != null && request.getMovieId() > 0) ? request.getMovieId() : null;

        // 3. Số liệu kỳ hiện tại
        BigDecimal currentNetRevenue = reportRepository.getNetRevenue(currentRange.startDateTime(), currentRange.endDateTime(), cinemaId, movieId);
        Long currentTotalTickets = reportRepository.getTotalTickets(currentRange.startDateTime(), currentRange.endDateTime(), cinemaId, movieId);
        Long currentMoviesCount = reportRepository.getMoviesWithSalesCount(currentRange.startDateTime(), currentRange.endDateTime(), cinemaId, movieId);
        List<TopMovieTicketProjection> topMovies = reportRepository.getTopMovieByTickets(currentRange.startDateTime(), currentRange.endDateTime(), cinemaId, movieId);

        String topMovieTitle = "Chưa có";
        long topMovieTicketCount = 0;
        if (!topMovies.isEmpty()) {
            topMovieTitle = topMovies.get(0).getMovieTitle();
            topMovieTicketCount = topMovies.get(0).getTicketCount() != null ? topMovies.get(0).getTicketCount() : 0;
        }

        // 4. Số liệu kỳ trước (để so sánh % tăng trưởng)
        BigDecimal prevNetRevenue = reportRepository.getNetRevenue(prevStart, prevEnd, cinemaId, movieId);
        Long prevTotalTickets = reportRepository.getTotalTickets(prevStart, prevEnd, cinemaId, movieId);

        Double ticketGrowth = calculateGrowthRate(
                currentTotalTickets != null ? currentTotalTickets : 0L,
                prevTotalTickets != null ? prevTotalTickets : 0L);
        Double revenueGrowth = calculateRevenueGrowthRate(currentNetRevenue, prevNetRevenue);

        SummaryCard summaryCard = SummaryCard.builder()
                .totalTickets(currentTotalTickets != null ? currentTotalTickets : 0L)
                .ticketGrowthRate(ticketGrowth)
                .netRevenue(currentNetRevenue != null ? currentNetRevenue : BigDecimal.ZERO)
                .revenueGrowthRate(revenueGrowth)
                .moviesWithSalesCount(currentMoviesCount != null ? currentMoviesCount : 0L)
                .topMovieTitle(topMovieTitle)
                .topMovieTicketCount(topMovieTicketCount)
                .build();

        // 5. Lấy Top 5 phim theo doanh thu thuần
        List<TopRevenueMovieProjection> revenueProjections = reportRepository.getTopRevenueMovies(
                currentRange.startDateTime(), currentRange.endDateTime(), cinemaId, movieId);
        List<TopRevenueMovieItem> topRevenueMovies = new ArrayList<>();
        BigDecimal maxRevenue = (!revenueProjections.isEmpty() && revenueProjections.get(0).getRevenue() != null)
                ? revenueProjections.get(0).getRevenue() : BigDecimal.ZERO;

        for (TopRevenueMovieProjection p : revenueProjections) {
            BigDecimal rev = p.getRevenue() != null ? p.getRevenue() : BigDecimal.ZERO;
            double percent = (maxRevenue.compareTo(BigDecimal.ZERO) > 0)
                    ? rev.multiply(BigDecimal.valueOf(100)).divide(maxRevenue, 1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            topRevenueMovies.add(TopRevenueMovieItem.builder()
                    .movieId(p.getMovieId())
                    .movieTitle(p.getMovieTitle())
                    .posterUrl(p.getPosterUrl())
                    .revenue(rev)
                    .percentage(percent)
                    .build());
        }

        // 6. Lấy Top 5 phim theo số vé đã bán
        List<TopTicketMovieProjection> ticketProjections = reportRepository.getTopTicketMovies(
                currentRange.startDateTime(), currentRange.endDateTime(), cinemaId, movieId);
        List<TopTicketMovieItem> topTicketMovies = new ArrayList<>();
        long maxTickets = (!ticketProjections.isEmpty() && ticketProjections.get(0).getTicketCount() != null)
                ? ticketProjections.get(0).getTicketCount() : 0L;

        for (TopTicketMovieProjection p : ticketProjections) {
            long count = p.getTicketCount() != null ? p.getTicketCount() : 0L;
            double percent = (maxTickets > 0)
                    ? Math.round((count * 100.0 / maxTickets) * 10.0) / 10.0
                    : 0.0;

            topTicketMovies.add(TopTicketMovieItem.builder()
                    .movieId(p.getMovieId())
                    .movieTitle(p.getMovieTitle())
                    .posterUrl(p.getPosterUrl())
                    .ticketCount(count)
                    .percentage(percent)
                    .build());
        }

        // 7. Lấy danh sách hiệu quả kinh doanh theo phim
        List<MoviePerformanceProjection> perfProjections = reportRepository.getMoviePerformances(
                currentRange.startDateTime(), currentRange.endDateTime(), cinemaId, movieId);
        List<MoviePerformanceItem> moviePerformances = new ArrayList<>();

        for (MoviePerformanceProjection p : perfProjections) {
            long ticketsSold = p.getTicketsSold() != null ? p.getTicketsSold() : 0L;
            long capacity = p.getTotalCapacity() != null ? p.getTotalCapacity() : 0L;
            double occupancy = (capacity > 0 && ticketsSold > 0)
                    ? Math.min(100.0, Math.round((ticketsSold * 100.0 / capacity) * 10.0) / 10.0)
                    : 0.0;

            moviePerformances.add(MoviePerformanceItem.builder()
                    .movieId(p.getMovieId())
                    .movieTitle(p.getMovieTitle())
                    .posterUrl(p.getPosterUrl())
                    .ticketsSold(ticketsSold)
                    .netRevenue(p.getNetRevenue() != null ? p.getNetRevenue() : BigDecimal.ZERO)
                    .showtimeCount(p.getShowtimeCount() != null ? p.getShowtimeCount() : 0L)
                    .occupancyRate(occupancy)
                    .build());
        }

        return MovieStatisticsResponse.builder()
                .summary(summaryCard)
                .topRevenueMovies(topRevenueMovies)
                .topTicketMovies(topTicketMovies)
                .moviePerformances(moviePerformances)
                .build();
    }

    @Override
    public MovieFilterOptionResponse getFilterOptions() {
        List<FilterOptionItem> cinemas = reportRepository.findAllCinemasFilter().stream()
                .map(c -> FilterOptionItem.builder().id(c.getId()).name(c.getName()).build())
                .toList();

        List<FilterOptionItem> movies = reportRepository.findAllMoviesFilter().stream()
                .map(m -> FilterOptionItem.builder().id(m.getId()).name(m.getName()).build())
                .toList();

        return MovieFilterOptionResponse.builder()
                .cinemas(cinemas)
                .movies(movies)
                .build();
    }

    @Override
    public byte[] exportMovieReportCsv(MovieStatisticsRequest request) {
        MovieStatisticsResponse stats = getMovieStatistics(request);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            // Ghi BOM UTF-8 để Microsoft Excel mở trực tiếp không bị lỗi font tiếng Việt
            out.write(0xEF);
            out.write(0xBB);
            out.write(0xBF);

            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

            writer.println("BÁO CÁO THỐNG KÊ PHIM VÀ DOANH THU (CHỈ TÍNH GIAO DỊCH THÀNH CÔNG)");
            writer.println();

            // Tổng quan
            SummaryCard s = stats.getSummary();
            writer.printf("Tổng vé đã thanh toán,%d\n", s.getTotalTickets());
            writer.printf("Tăng trưởng vé so với kỳ trước,%.1f%%\n", s.getTicketGrowthRate() != null ? s.getTicketGrowthRate() : 0.0);
            writer.printf("Doanh thu thuần (sau giảm giá),%s\n", currencyFormat.format(s.getNetRevenue()));
            writer.printf("Số phim có vé bán ra,%d\n", s.getMoviesWithSalesCount());
            writer.printf("Phim bán nhiều vé nhất,%s (%d vé)\n", s.getTopMovieTitle(), s.getTopMovieTicketCount());
            writer.println();

            // Bảng chi tiết
            writer.println("Tên phim,Vé đã bán,Doanh thu thuần (VNĐ),Số suất chiếu,Tỷ lệ lấp đầy (%)");
            for (MoviePerformanceItem item : stats.getMoviePerformances()) {
                writer.printf("\"%s\",%d,\"%s\",%d,%.1f%%\n",
                        item.getMovieTitle().replace("\"", "\"\""),
                        item.getTicketsSold(),
                        currencyFormat.format(item.getNetRevenue()),
                        item.getShowtimeCount(),
                        item.getOccupancyRate()
                );
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xuất file báo cáo thống kê", e);
        }

        return out.toByteArray();
    }

    private Double calculateGrowthRate(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        double rate = ((double) (current - previous) / previous) * 100.0;
        return Math.round(rate * 10.0) / 10.0;
    }

    private Double calculateRevenueGrowthRate(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return (current != null && current.compareTo(BigDecimal.ZERO) > 0) ? 100.0 : 0.0;
        }
        if (current == null) {
            return -100.0;
        }
        double prevVal = previous.doubleValue();
        double currVal = current.doubleValue();
        double rate = ((currVal - prevVal) / prevVal) * 100.0;
        return Math.round(rate * 10.0) / 10.0;
    }

    private record TimeRange(LocalDate startDate, LocalDate endDate, LocalDateTime startDateTime, LocalDateTime endDateTime) {}

    private TimeRange resolveTimeRange(MovieStatisticsRequest request) {
        LocalDate start;
        LocalDate end;
        LocalDate today = LocalDate.now();

        if (request.getFromDate() != null && request.getToDate() != null) {
            start = request.getFromDate();
            end = request.getToDate();
        } else {
            String type = request.getTimeType() != null ? request.getTimeType().toUpperCase() : "THANG";
            switch (type) {
                case "NGAY", "DAY" -> {
                    start = today;
                    end = today;
                }
                case "TUAN", "WEEK" -> {
                    start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                    end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
                }
                case "THANG", "MONTH" -> {
                    start = today.with(TemporalAdjusters.firstDayOfMonth());
                    end = today.with(TemporalAdjusters.lastDayOfMonth());
                }
                default -> {
                    start = today.with(TemporalAdjusters.firstDayOfMonth());
                    end = today.with(TemporalAdjusters.lastDayOfMonth());
                }
            }
        }

        if (start.isAfter(end)) {
            LocalDate temp = start;
            start = end;
            end = temp;
        }

        return new TimeRange(start, end, start.atStartOfDay(), end.atTime(LocalTime.MAX));
    }
}

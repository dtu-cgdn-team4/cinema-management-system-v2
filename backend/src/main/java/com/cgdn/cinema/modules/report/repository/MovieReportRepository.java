package com.cgdn.cinema.modules.report.repository;

import com.cgdn.cinema.modules.movie.entity.Movie;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA Repository cho Thống kê phim & Doanh thu (Task 6.16.1.1).
 * Sử dụng Spring Data JPA Interface với Native Queries và Projections giúp code gọn gàng,
 * tự động map kết quả truy vấn mà không cần RowMapper thủ công.
 */
@Repository
public interface MovieReportRepository extends JpaRepository<Movie, Long> {

    // --- PROJECTIONS (Giao diện hứng dữ liệu tự động của Spring Data JPA) ---

    interface TopMovieTicketProjection {
        String getMovieTitle();
        Long getTicketCount();
    }

    interface TopRevenueMovieProjection {
        Long getMovieId();
        String getMovieTitle();
        String getPosterUrl();
        BigDecimal getRevenue();
    }

    interface TopTicketMovieProjection {
        Long getMovieId();
        String getMovieTitle();
        String getPosterUrl();
        Long getTicketCount();
    }

    interface MoviePerformanceProjection {
        Long getMovieId();
        String getMovieTitle();
        String getPosterUrl();
        Long getTicketsSold();
        BigDecimal getNetRevenue();
        Long getShowtimeCount();
        Long getTotalCapacity();
    }

    interface FilterOptionProjection {
        Long getId();
        String getName();
    }

    // --- CÁC QUERY PHỤC VỤ THỐNG KÊ ---

    /**
     * Tính tổng doanh thu thuần (sau giảm giá, ưu đãi) của các đơn hàng thành công
     */
    @Query(value = """
            SELECT COALESCE(SUM(dv.thanh_tien), 0)
            FROM dat_ve dv
            JOIN suat_chieu sc ON dv.suat_chieu_id = sc.id
            JOIN phong_chieu pc ON sc.phong_chieu_id = pc.id
            WHERE dv.trang_thai_dat_ve = 'DA_THANH_TOAN'
              AND dv.thanh_toan_luc BETWEEN :startTime AND :endTime
              AND (:cinemaId IS NULL OR pc.rap_id = :cinemaId)
              AND (:movieId IS NULL OR sc.phim_id = :movieId)
            """, nativeQuery = true)
    BigDecimal getNetRevenue(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId
    );

    /**
     * Tính tổng số lượng vé đã thanh toán thành công
     */
    @Query(value = """
            SELECT COALESCE(COUNT(gsc.id), 0)
            FROM dat_ve dv
            JOIN suat_chieu sc ON dv.suat_chieu_id = sc.id
            JOIN phong_chieu pc ON sc.phong_chieu_id = pc.id
            JOIN ghe_suat_chieu gsc ON gsc.dat_ve_id = dv.id
            WHERE dv.trang_thai_dat_ve = 'DA_THANH_TOAN'
              AND dv.thanh_toan_luc BETWEEN :startTime AND :endTime
              AND (:cinemaId IS NULL OR pc.rap_id = :cinemaId)
              AND (:movieId IS NULL OR sc.phim_id = :movieId)
            """, nativeQuery = true)
    Long getTotalTickets(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId
    );

    /**
     * Đếm số lượng phim có vé bán ra thành công trong kỳ
     */
    @Query(value = """
            SELECT COALESCE(COUNT(DISTINCT sc.phim_id), 0)
            FROM dat_ve dv
            JOIN suat_chieu sc ON dv.suat_chieu_id = sc.id
            JOIN phong_chieu pc ON sc.phong_chieu_id = pc.id
            WHERE dv.trang_thai_dat_ve = 'DA_THANH_TOAN'
              AND dv.thanh_toan_luc BETWEEN :startTime AND :endTime
              AND (:cinemaId IS NULL OR pc.rap_id = :cinemaId)
              AND (:movieId IS NULL OR sc.phim_id = :movieId)
            """, nativeQuery = true)
    Long getMoviesWithSalesCount(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId
    );

    /**
     * Lấy phim bán nhiều vé nhất trong kỳ
     */
    @Query(value = """
            SELECT p.ten_phim AS movieTitle, COUNT(gsc.id) AS ticketCount
            FROM dat_ve dv
            JOIN suat_chieu sc ON dv.suat_chieu_id = sc.id
            JOIN phong_chieu pc ON sc.phong_chieu_id = pc.id
            JOIN phim p ON sc.phim_id = p.id
            JOIN ghe_suat_chieu gsc ON gsc.dat_ve_id = dv.id
            WHERE dv.trang_thai_dat_ve = 'DA_THANH_TOAN'
              AND dv.thanh_toan_luc BETWEEN :startTime AND :endTime
              AND (:cinemaId IS NULL OR pc.rap_id = :cinemaId)
              AND (:movieId IS NULL OR sc.phim_id = :movieId)
            GROUP BY p.id, p.ten_phim
            ORDER BY ticketCount DESC, p.id ASC
            LIMIT 1
            """, nativeQuery = true)
    List<TopMovieTicketProjection> getTopMovieByTickets(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId
    );

    /**
     * Lấy Top 5 phim theo doanh thu thuần giảm dần
     */
    @Query(value = """
            SELECT
                p.id AS movieId,
                p.ten_phim AS movieTitle,
                p.poster_url AS posterUrl,
                COALESCE(SUM(dv.thanh_tien), 0) AS revenue
            FROM dat_ve dv
            JOIN suat_chieu sc ON dv.suat_chieu_id = sc.id
            JOIN phong_chieu pc ON sc.phong_chieu_id = pc.id
            JOIN phim p ON sc.phim_id = p.id
            WHERE dv.trang_thai_dat_ve = 'DA_THANH_TOAN'
              AND dv.thanh_toan_luc BETWEEN :startTime AND :endTime
              AND (:cinemaId IS NULL OR pc.rap_id = :cinemaId)
              AND (:movieId IS NULL OR sc.phim_id = :movieId)
            GROUP BY p.id, p.ten_phim, p.poster_url
            ORDER BY revenue DESC, p.id ASC
            LIMIT 5
            """, nativeQuery = true)
    List<TopRevenueMovieProjection> getTopRevenueMovies(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId
    );

    /**
     * Lấy Top 5 phim theo số vé đã bán giảm dần
     */
    @Query(value = """
            SELECT
                p.id AS movieId,
                p.ten_phim AS movieTitle,
                p.poster_url AS posterUrl,
                COUNT(gsc.id) AS ticketCount
            FROM dat_ve dv
            JOIN suat_chieu sc ON dv.suat_chieu_id = sc.id
            JOIN phong_chieu pc ON sc.phong_chieu_id = pc.id
            JOIN phim p ON sc.phim_id = p.id
            JOIN ghe_suat_chieu gsc ON gsc.dat_ve_id = dv.id
            WHERE dv.trang_thai_dat_ve = 'DA_THANH_TOAN'
              AND dv.thanh_toan_luc BETWEEN :startTime AND :endTime
              AND (:cinemaId IS NULL OR pc.rap_id = :cinemaId)
              AND (:movieId IS NULL OR sc.phim_id = :movieId)
            GROUP BY p.id, p.ten_phim, p.poster_url
            ORDER BY ticketCount DESC, p.id ASC
            LIMIT 5
            """, nativeQuery = true)
    List<TopTicketMovieProjection> getTopTicketMovies(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId
    );

    /**
     * Lấy danh sách hiệu quả kinh doanh theo phim (doanh thu, vé bán, số suất chiếu, sức chứa ghế)
     */
    @Query(value = """
            SELECT
                p.id AS movieId,
                p.ten_phim AS movieTitle,
                p.poster_url AS posterUrl,
                COALESCE(ticket_stats.tickets_sold, 0) AS ticketsSold,
                COALESCE(revenue_stats.net_revenue, 0) AS netRevenue,
                COALESCE(showtime_stats.showtime_count, 0) AS showtimeCount,
                COALESCE(showtime_stats.total_capacity, 0) AS totalCapacity
            FROM phim p
            LEFT JOIN (
                SELECT sc.phim_id, SUM(dv.thanh_tien) AS net_revenue
                FROM dat_ve dv
                JOIN suat_chieu sc ON dv.suat_chieu_id = sc.id
                JOIN phong_chieu pc ON sc.phong_chieu_id = pc.id
                WHERE dv.trang_thai_dat_ve = 'DA_THANH_TOAN'
                  AND dv.thanh_toan_luc BETWEEN :startTime AND :endTime
                  AND (:cinemaId IS NULL OR pc.rap_id = :cinemaId)
                GROUP BY sc.phim_id
            ) revenue_stats ON revenue_stats.phim_id = p.id
            LEFT JOIN (
                SELECT sc.phim_id, COUNT(gsc.id) AS tickets_sold
                FROM dat_ve dv
                JOIN suat_chieu sc ON dv.suat_chieu_id = sc.id
                JOIN phong_chieu pc ON sc.phong_chieu_id = pc.id
                JOIN ghe_suat_chieu gsc ON gsc.dat_ve_id = dv.id
                WHERE dv.trang_thai_dat_ve = 'DA_THANH_TOAN'
                  AND dv.thanh_toan_luc BETWEEN :startTime AND :endTime
                  AND (:cinemaId IS NULL OR pc.rap_id = :cinemaId)
                GROUP BY sc.phim_id
            ) ticket_stats ON ticket_stats.phim_id = p.id
            LEFT JOIN (
                SELECT
                    sc.phim_id,
                    COUNT(DISTINCT sc.id) AS showtime_count,
                    SUM(COALESCE(seat_cap.seat_count, pc.so_hang * pc.so_cot, 50)) AS total_capacity
                FROM suat_chieu sc
                JOIN phong_chieu pc ON sc.phong_chieu_id = pc.id
                LEFT JOIN (
                    SELECT phong_chieu_id, COUNT(*) AS seat_count
                    FROM ghe
                    WHERE trang_thai = 1
                    GROUP BY phong_chieu_id
                ) seat_cap ON seat_cap.phong_chieu_id = pc.id
                WHERE sc.bat_dau BETWEEN :startTime AND :endTime
                  AND (:cinemaId IS NULL OR pc.rap_id = :cinemaId)
                GROUP BY sc.phim_id
            ) showtime_stats ON showtime_stats.phim_id = p.id
            WHERE (:movieId IS NULL OR p.id = :movieId)
              AND (revenue_stats.net_revenue > 0 OR ticket_stats.tickets_sold > 0 OR showtime_stats.showtime_count > 0)
            ORDER BY netRevenue DESC, ticketsSold DESC, p.id ASC
            """, nativeQuery = true)
    List<MoviePerformanceProjection> getMoviePerformances(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId
    );

    /**
     * Lấy danh sách rạp cho dropdown bộ lọc
     */
    @Query(value = "SELECT id, ten_rap AS name FROM rap WHERE trang_thai = 1 ORDER BY ten_rap ASC", nativeQuery = true)
    List<FilterOptionProjection> findAllCinemasFilter();

    /**
     * Lấy danh sách phim cho dropdown bộ lọc
     */
    @Query(value = "SELECT id, ten_phim AS name FROM phim ORDER BY ten_phim ASC", nativeQuery = true)
    List<FilterOptionProjection> findAllMoviesFilter();
}

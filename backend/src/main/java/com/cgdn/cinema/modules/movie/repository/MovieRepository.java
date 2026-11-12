package com.cgdn.cinema.modules.movie.repository;

import com.cgdn.cinema.modules.movie.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Repository cho bảng <code>phim</code>.
 */
@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    /**
     * Tìm phim theo id, chỉ lấy phim đang hoạt động (trang_thai = 1), kèm fetch thể loại.
     */
    @Query("SELECT m FROM Movie m LEFT JOIN FETCH m.theLoai WHERE m.id = :id AND m.trangThai = 1")
    Optional<Movie> findActiveById(@Param("id") Long id);

    /**
     * Danh sách phim đang chiếu: ngayKhoiChieu <= today <= ngayKetThuc, trangThai = 1.
     * Hỗ trợ lọc theo thể loại (genreId).
     */
    @Query(value = """
            SELECT m FROM Movie m
            WHERE m.trangThai = 1
              AND m.ngayKhoiChieu <= :today
              AND m.ngayKetThuc >= :today
              AND (:genreId IS NULL OR EXISTS (
                  SELECT 1 FROM m.theLoai g WHERE g.id = :genreId
              ))
            """,
            countQuery = """
            SELECT COUNT(m) FROM Movie m
            WHERE m.trangThai = 1
              AND m.ngayKhoiChieu <= :today
              AND m.ngayKetThuc >= :today
              AND (:genreId IS NULL OR EXISTS (
                  SELECT 1 FROM m.theLoai g WHERE g.id = :genreId
              ))
            """)
    Page<Movie> findNowShowing(
            @Param("today") LocalDate today,
            @Param("genreId") Long genreId,
            Pageable pageable
    );

    /**
     * Danh sách phim sắp chiếu: ngayKhoiChieu > today, trangThai = 1.
     * Hỗ trợ lọc theo thể loại (genreId).
     */
    @Query(value = """
            SELECT m FROM Movie m
            WHERE m.trangThai = 1
              AND m.ngayKhoiChieu > :today
              AND (:genreId IS NULL OR EXISTS (
                  SELECT 1 FROM m.theLoai g WHERE g.id = :genreId
              ))
            """,
            countQuery = """
            SELECT COUNT(m) FROM Movie m
            WHERE m.trangThai = 1
              AND m.ngayKhoiChieu > :today
              AND (:genreId IS NULL OR EXISTS (
                  SELECT 1 FROM m.theLoai g WHERE g.id = :genreId
              ))
            """)
    Page<Movie> findComingSoon(
            @Param("today") LocalDate today,
            @Param("genreId") Long genreId,
            Pageable pageable
    );
}

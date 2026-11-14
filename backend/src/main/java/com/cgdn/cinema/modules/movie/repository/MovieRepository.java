package com.cgdn.cinema.modules.movie.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import com.cgdn.cinema.modules.movie.entity.Movie;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {

    String SHOWING = "m.status = :status and m.releaseDate <= :today and m.endDate >= :today";
    String GENRE_FILTER = "(:genreId IS NULL OR EXISTS (SELECT 1 FROM m.genres g WHERE g.id = :genreId))";
    String COMING_SOON = "m.status = :status and m.releaseDate > :today";

    interface GenreOption {
        Long getId();
        String getName();
    }

    @Query("SELECT g.id AS id, g.name AS name FROM Genre g ORDER BY g.name, g.id")
    List<GenreOption> findGenreOptions();

    @EntityGraph(attributePaths = "genres")
    @Query("select m from Movie m where " + SHOWING + " order by m.releaseDate desc, m.id")
    List<Movie> findShowing(@Param("today") LocalDate today, @Param("status") int status);

    @Query("select m from Movie m where m.id = :id and " + SHOWING)
    Optional<Movie> findShowingById(@Param("id") Long id, @Param("today") LocalDate today, @Param("status") int status);

    // Không fetch collection trong truy vấn phân trang để phân trang tại database.
    @Query(value = "SELECT m FROM Movie m WHERE " + SHOWING + " AND " + GENRE_FILTER,
            countQuery = "SELECT COUNT(m) FROM Movie m WHERE " + SHOWING + " AND " + GENRE_FILTER)
    Page<Movie> findShowing(@Param("today") LocalDate today, @Param("status") int status,
                           @Param("genreId") Long genreId, Pageable pageable);

    @Query(value = "SELECT m FROM Movie m WHERE " + COMING_SOON + " AND " + GENRE_FILTER,
            countQuery = "SELECT COUNT(m) FROM Movie m WHERE " + COMING_SOON + " AND " + GENRE_FILTER)
    Page<Movie> findComingSoon(@Param("today") LocalDate today, @Param("status") int status,
                              @Param("genreId") Long genreId, Pageable pageable);

    /** Đếm số suất chiếu liên kết với phim theo khóa ngoại phim_id trong bảng suat_chieu. */
    @Query(value = "SELECT COUNT(*) FROM suat_chieu WHERE phim_id = :movieId", nativeQuery = true)
    long countShowtimesByMovieId(@Param("movieId") Long movieId);
}

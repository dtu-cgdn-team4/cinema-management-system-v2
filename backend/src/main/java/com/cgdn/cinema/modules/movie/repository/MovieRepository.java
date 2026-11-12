package com.cgdn.cinema.modules.movie.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import com.cgdn.cinema.modules.movie.entity.Movie;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    String SHOWING = "m.status = :status and m.releaseDate <= :today and m.endDate >= :today";

    @EntityGraph(attributePaths = "genres")
    @Query("select m from Movie m where " + SHOWING + " order by m.releaseDate desc, m.id")
    List<Movie> findShowing(@Param("today") LocalDate today, @Param("status") int status);

    @Query("select m from Movie m where m.id = :id and " + SHOWING)
    Optional<Movie> findShowingById(@Param("id") Long id, @Param("today") LocalDate today, @Param("status") int status);

    @Query(value = """
            SELECT m FROM Movie m
            WHERE m.status = 1
              AND m.releaseDate <= :today AND m.endDate >= :today
              AND (:genreId IS NULL OR EXISTS (
                  SELECT 1 FROM m.genres g WHERE g.id = :genreId
              ))
            """, countQuery = """
            SELECT COUNT(m) FROM Movie m
            WHERE m.status = 1
              AND m.releaseDate <= :today AND m.endDate >= :today
              AND (:genreId IS NULL OR EXISTS (
                  SELECT 1 FROM m.genres g WHERE g.id = :genreId
              ))
            """)
    Page<Movie> findNowShowing(@Param("today") LocalDate today,
                              @Param("genreId") Long genreId, Pageable pageable);

    @Query(value = """
            SELECT m FROM Movie m
            WHERE m.status = 1 AND m.releaseDate > :today
              AND (:genreId IS NULL OR EXISTS (
                  SELECT 1 FROM m.genres g WHERE g.id = :genreId
              ))
            """, countQuery = """
            SELECT COUNT(m) FROM Movie m
            WHERE m.status = 1 AND m.releaseDate > :today
              AND (:genreId IS NULL OR EXISTS (
                  SELECT 1 FROM m.genres g WHERE g.id = :genreId
              ))
            """)
    Page<Movie> findComingSoon(@Param("today") LocalDate today,
                              @Param("genreId") Long genreId, Pageable pageable);
}

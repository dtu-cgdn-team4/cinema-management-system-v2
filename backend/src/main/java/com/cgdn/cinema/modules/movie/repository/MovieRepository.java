package com.cgdn.cinema.modules.movie.repository;

import com.cgdn.cinema.modules.movie.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {

    /** Đếm số suất chiếu liên kết với phim theo khóa ngoại phim_id trong bảng suat_chieu. */
    @Query(value = "SELECT COUNT(*) FROM suat_chieu WHERE phim_id = :movieId", nativeQuery = true)
    long countShowtimesByMovieId(@Param("movieId") Long movieId);
}


package com.cgdn.cinema.modules.showtime.repository;

import java.time.LocalDateTime;
import java.util.List;
import com.cgdn.cinema.modules.showtime.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    @Query("""
            select s from Showtime s join fetch s.room r join fetch r.cinema c
            where s.movieId = :movieId and s.status = :status and r.status = :status and c.status = :status
              and s.startTime > :after
            order by s.startTime, r.name""")
    List<Showtime> findUpcomingByMovie(@Param("movieId") Long movieId,
                                       @Param("after") LocalDateTime after,
                                       @Param("status") int status);
}

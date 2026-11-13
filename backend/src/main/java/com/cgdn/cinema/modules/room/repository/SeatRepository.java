package com.cgdn.cinema.modules.room.repository;

import java.util.Collection;
import java.util.List;
import com.cgdn.cinema.modules.room.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    /** Mỗi phần tử: [roomId, số ghế]. */
    @Query("select s.roomId, count(s) from Seat s where s.roomId in :roomIds and s.status = :status group by s.roomId")
    List<Object[]> countByRoom(@Param("roomIds") Collection<Long> roomIds, @Param("status") int status);

    List<Seat> findByRoomIdAndStatusOrderByRowNameAscGridColumnAsc(Long roomId, int status);
}

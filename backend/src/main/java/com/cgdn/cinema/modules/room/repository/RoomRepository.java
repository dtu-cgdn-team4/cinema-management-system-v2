package com.cgdn.cinema.modules.room.repository;

import java.util.List;
import com.cgdn.cinema.modules.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Long> {

    /** Mỗi phần tử: [cinemaId, số phòng]. */
    @Query("select r.cinema.id, count(r) from Room r where r.status = :status group by r.cinema.id")
    List<Object[]> countByCinema(@Param("status") int status);
}

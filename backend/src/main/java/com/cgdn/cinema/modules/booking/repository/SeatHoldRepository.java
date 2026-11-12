package com.cgdn.cinema.modules.booking.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import com.cgdn.cinema.modules.booking.entity.SeatHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface SeatHoldRepository extends JpaRepository<SeatHold, Long> {

    /** Ghế đang có người: mọi bản ghi trừ DANG_GIU đã quá hạn. */
    String ACTIVE = "(h.status <> com.cgdn.cinema.common.enums.SeatStatus.DANG_GIU or h.expiresAt > :now)";

    /** DANG_GIU đã quá hạn. */
    String EXPIRED = "h.status = com.cgdn.cinema.common.enums.SeatStatus.DANG_GIU and h.expiresAt <= :now";

    @Query("select h from SeatHold h where h.showtimeId = :showtimeId and " + ACTIVE)
    List<SeatHold> findActive(@Param("showtimeId") Long showtimeId, @Param("now") LocalDateTime now);

    /** Mỗi phần tử: [showtimeId, số ghế đã có người]. */
    @Query("select h.showtimeId, count(h) from SeatHold h where h.showtimeId in :ids and " + ACTIVE
            + " group by h.showtimeId")
    List<Object[]> countActiveByShowtime(@Param("ids") Collection<Long> showtimeIds, @Param("now") LocalDateTime now);

    @Query("select distinct h.showtimeId from SeatHold h where " + EXPIRED)
    List<Long> findShowtimesWithExpiredHolds(@Param("now") LocalDateTime now);

    /** Xóa vật lý để unique (suat_chieu_id, ghe_id) trống chỗ cho người khác giữ (database.md). */
    @Transactional
    @Modifying
    @Query("delete from SeatHold h where " + EXPIRED)
    int deleteExpired(@Param("now") LocalDateTime now);

    @Transactional
    @Modifying
    @Query("delete from SeatHold h where h.showtimeId = :showtimeId and " + EXPIRED)
    int deleteExpiredIn(@Param("showtimeId") Long showtimeId, @Param("now") LocalDateTime now);

    /** Nhả các ghế khách đang giữ ở suất này, dùng khi khách chọn lại ghế. */
    @Transactional
    @Modifying
    @Query("delete from SeatHold h where h.showtimeId = :showtimeId and h.userId = :userId"
            + " and h.status = com.cgdn.cinema.common.enums.SeatStatus.DANG_GIU")
    int deleteHeldBy(@Param("showtimeId") Long showtimeId, @Param("userId") Long userId);
}

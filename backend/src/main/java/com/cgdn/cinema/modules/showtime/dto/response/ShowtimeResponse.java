package com.cgdn.cinema.modules.showtime.dto.response;

import java.time.LocalDateTime;

/**
 * Một suất chiếu trong màn hình chọn suất.
 * endTime là giờ phim kết thúc (không gồm dọn phòng); price là giá ghế thường của ngày chiếu.
 */
public record ShowtimeResponse(
        Long id,
        Long movieId,
        Long cinemaId,
        String cinemaName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        RoomInfo room,
        int availableSeats,
        Long price) {

    public record RoomInfo(Long id, String name, int totalSeats) {
    }
}

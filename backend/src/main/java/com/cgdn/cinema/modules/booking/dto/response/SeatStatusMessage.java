package com.cgdn.cinema.modules.booking.dto.response;

import java.util.List;

/** Tin WebSocket trên /topic/showtimes/{showtimeId}/seats: toàn bộ ghế đang giữ hoặc đã bán của suất. */
public record SeatStatusMessage(Long showtimeId, List<Long> takenSeatIds) {
}

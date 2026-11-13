package com.cgdn.cinema.modules.booking.queue;

import java.util.List;

/** Yêu cầu giữ ghế gửi qua RabbitMQ; số lượng ghế đã được kiểm tra trước khi gửi. */
public record SeatHoldCommand(Long userId, Long showtimeId, List<Long> seatIds) {
}

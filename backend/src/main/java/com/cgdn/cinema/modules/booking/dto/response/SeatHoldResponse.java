package com.cgdn.cinema.modules.booking.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import com.cgdn.cinema.common.enums.SeatType;

/**
 * Ghế khách đang giữ đến expiresAt. Giá để hiển thị theo bảng giá hiện tại;
 * giá chốt khi khách xác nhận thanh toán (Q&A #25).
 */
public record SeatHoldResponse(
        Long showtimeId,
        LocalDateTime expiresAt,
        List<HeldSeat> seats,
        long totalPrice) {

    public record HeldSeat(Long id, String label, SeatType type, long price) {
    }
}

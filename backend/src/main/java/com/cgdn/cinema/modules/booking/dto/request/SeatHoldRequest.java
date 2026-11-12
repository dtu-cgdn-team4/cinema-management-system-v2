package com.cgdn.cinema.modules.booking.dto.request;

import java.util.List;
import jakarta.validation.constraints.NotNull;

/** quantity: số lượng ghế khách chọn ở combobox; seatIds: các ghế khách bấm trên sơ đồ (SRS 6.2.2). */
public record SeatHoldRequest(
        @NotNull Integer quantity,
        @NotNull List<@NotNull Long> seatIds) {
}

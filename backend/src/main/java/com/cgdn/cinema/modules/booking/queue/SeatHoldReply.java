package com.cgdn.cinema.modules.booking.queue;

import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.booking.dto.response.SeatHoldResponse;

/** Kết quả consumer trả về người gửi: result khi giữ được ghế, errorCode khi bị từ chối. */
public record SeatHoldReply(SeatHoldResponse result, ErrorCode errorCode) {
}

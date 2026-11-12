package com.cgdn.cinema.modules.booking.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.modules.booking.dto.request.SeatHoldRequest;
import com.cgdn.cinema.modules.booking.dto.response.SeatHoldResponse;
import com.cgdn.cinema.modules.booking.dto.response.SeatMapResponse;
import com.cgdn.cinema.modules.booking.service.SeatHoldService;
import com.cgdn.cinema.modules.booking.service.SeatMapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/showtimes/{showtimeId}/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatMapService seatMapService;
    private final SeatHoldService seatHoldService;

    /** Sơ đồ ghế; suất không tồn tại hoặc đã bắt đầu trả 404. */
    @GetMapping
    public ApiResponse<SeatMapResponse> getSeatMap(@PathVariable Long showtimeId) {
        return ApiResponse.success(seatMapService.getSeatMap(showtimeId));
    }

    /**
     * Giữ ghế 10 phút khi khách bấm "Tiếp tục" (SRS 6.2.2). Yêu cầu đi qua RabbitMQ, xử lý tuần tự.
     * ponytail: user tạm lấy từ header X-User-Id vì develop chưa có đăng nhập; khi có JWT thì lấy từ token và bỏ header.
     */
    @PostMapping("/hold")
    public ApiResponse<SeatHoldResponse> holdSeats(@PathVariable Long showtimeId,
                                                   @RequestHeader(name = "X-User-Id", required = false) Long userId,
                                                   @Valid @RequestBody SeatHoldRequest request) {
        return ApiResponse.success(seatHoldService.hold(userId, showtimeId, request));
    }
}

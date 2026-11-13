package com.cgdn.cinema.modules.ticket.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Chi tiết đơn đã mua; không chứa QR, phí dịch vụ hoặc trạng thái gửi thông báo suy đoán. */
public record MemberTicketDetailResponse(
        String bookingCode,
        String channel,
        LocalDateTime bookedAt,
        LocalDateTime paidAt,
        LocalDateTime collectedAt,
        String bookingStatus,
        Movie movie,
        Cinema cinema,
        Room room,
        Showtime showtime,
        long seatCount,
        List<Seat> seats,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        String currency,
        Recipient recipient,
        List<Payment> payments,
        LocalDateTime serverTime,
        String timeZone) {

    public MemberTicketDetailResponse {
        seats = List.copyOf(seats);
        payments = List.copyOf(payments);
    }

    public record Movie(long id, String title, String posterUrl, int durationMinutes, String ageRating) {
    }

    public record Cinema(long id, String name, String address) {
    }

    public record Room(long id, String name) {
    }

    /** endsAt là giờ kết thúc phim, không bao gồm thời gian dọn phòng. */
    public record Showtime(long id, LocalDateTime startsAt, LocalDateTime endsAt) {
    }

    /** Giữ nguyên hàng/số ghế và giá đã chốt; price có thể null. */
    public record Seat(long seatId, String rowName, int number, String type, BigDecimal price) {
    }

    /** Thông tin người nhận trên đơn, có thể khác chủ tài khoản. */
    public record Recipient(String name, String email, String phoneNumber) {
    }

    /** Giữ nguyên mọi giao dịch và trạng thái do database cung cấp. */
    public record Payment(String method, BigDecimal amount, String transactionCode, String status,
                          LocalDateTime occurredAt) {
    }
}

package com.cgdn.cinema.modules.ticket.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Dữ liệu chỉ đọc từ schema hiện có, không phải Entity hoặc response của API. */
public final class MemberTicketReadModel {

    private MemberTicketReadModel() {
    }

    public record Booking(
            long id,
            String bookingCode,
            String channel,
            LocalDateTime createdAt,
            LocalDateTime paidAt,
            LocalDateTime collectedAt,
            String status,
            BigDecimal subtotal,
            BigDecimal discountAmount,
            BigDecimal totalAmount,
            long seatCount,
            Movie movie,
            Showtime showtime) {
    }

    public record Movie(long id, String title, String posterUrl, int durationMinutes, String ageRating) {
    }

    /** scheduledEndsAt là suat_chieu.ket_thuc, đã bao gồm thời gian dọn phòng. */
    public record Showtime(
            long id,
            LocalDateTime startsAt,
            LocalDateTime scheduledEndsAt,
            long roomId,
            String roomName,
            long cinemaId,
            String cinemaName,
            String cinemaAddress) {
    }

    public record Recipient(String name, String email, String phoneNumber) {
    }

    /** price lấy từ ghe_suat_chieu.gia; giữ nguyên null nếu dữ liệu chưa có giá chốt. */
    public record Seat(long seatId, String rowName, int number, String type, BigDecimal price) {
    }

    /** Giữ nguyên trạng thái giao dịch trong DB, không suy đoán trạng thái thành công. */
    public record Payment(
            long id,
            String method,
            BigDecimal amount,
            String transactionCode,
            String status,
            LocalDateTime occurredAt) {
    }

    public record Detail(Booking booking, Recipient recipient, List<Seat> seats, List<Payment> payments) {

        public Detail {
            seats = List.copyOf(seats);
            payments = List.copyOf(payments);
        }
    }
}

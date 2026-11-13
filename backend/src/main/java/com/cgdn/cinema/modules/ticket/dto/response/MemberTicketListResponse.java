package com.cgdn.cinema.modules.ticket.dto.response;

import com.cgdn.cinema.common.response.PageResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MemberTicketListResponse(
        PageResponse<Ticket> tickets,
        Counts counts,
        LocalDateTime serverTime,
        String timeZone) {

    public record Counts(long all, long upcoming, long history) {
    }

    public record Ticket(
            String bookingCode,
            LocalDateTime bookedAt,
            LocalDateTime paidAt,
            Movie movie,
            Showtime showtime,
            long seatCount,
            BigDecimal totalAmount,
            String currency,
            String bookingStatus,
            LocalDateTime collectedAt) {
    }

    public record Movie(long id, String title, String posterUrl) {
    }

    public record Showtime(long id, LocalDateTime startsAt, String roomName, String cinemaName) {
    }
}

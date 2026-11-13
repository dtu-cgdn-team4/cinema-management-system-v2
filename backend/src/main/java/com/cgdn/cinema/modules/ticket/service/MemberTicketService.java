package com.cgdn.cinema.modules.ticket.service;

import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.common.response.PageResponse;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.ticket.dto.response.MemberTicketDetailResponse;
import com.cgdn.cinema.modules.ticket.dto.response.MemberTicketListResponse;
import com.cgdn.cinema.modules.ticket.dto.response.MemberTicketListResponse.Ticket;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Booking;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.BookingView;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadRepository;
import java.time.Clock;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MemberTicketService {

    private final MemberTicketReadRepository repository;
    private final Clock clock;

    public MemberTicketService(MemberTicketReadRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public MemberTicketListResponse getBookings(long userId, int page, int size, BookingView view) {
        if (page < 0 || size < 1 || size > 100 || view == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST,
                    "page phải từ 0, size từ 1 đến 100 và view phải là ALL, UPCOMING hoặc HISTORY.");
        }

        // Chụp một mốc giờ Việt Nam cho cả bộ lọc, counts và response.
        LocalDateTime now = LocalDateTime.ofInstant(clock.instant(), AppConstants.ZONE);
        var counts = repository.countPaidBookingsByUserId(userId, now);
        var tickets = repository.findPaidBookingsByUserId(userId, page, size, view, now).map(this::toTicket);

        return new MemberTicketListResponse(PageResponse.from(tickets),
                new MemberTicketListResponse.Counts(counts.all(), counts.upcoming(), counts.history()),
                now, AppConstants.ZONE.getId());
    }

    public MemberTicketDetailResponse getBooking(long userId, String bookingCode) {
        if (bookingCode == null || bookingCode.isBlank() || bookingCode.length() > 50) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Không tìm thấy vé đã mua.");
        }
        var detail = repository.findPaidBookingByCodeAndUserId(bookingCode, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Không tìm thấy vé đã mua."));
        var booking = detail.booking();
        var movie = booking.movie();
        var showtime = booking.showtime();
        var recipient = detail.recipient();
        LocalDateTime endsAt = showtime.startsAt().plusMinutes(movie.durationMinutes());
        LocalDateTime now = LocalDateTime.ofInstant(clock.instant(), AppConstants.ZONE);

        return new MemberTicketDetailResponse(booking.bookingCode(), booking.channel(), booking.createdAt(),
                booking.paidAt(), booking.collectedAt(), booking.status(),
                new MemberTicketDetailResponse.Movie(movie.id(), movie.title(), movie.posterUrl(),
                        movie.durationMinutes(), movie.ageRating()),
                new MemberTicketDetailResponse.Cinema(showtime.cinemaId(), showtime.cinemaName(),
                        showtime.cinemaAddress()),
                new MemberTicketDetailResponse.Room(showtime.roomId(), showtime.roomName()),
                new MemberTicketDetailResponse.Showtime(showtime.id(), showtime.startsAt(), endsAt),
                booking.seatCount(), detail.seats().stream()
                        .map(seat -> new MemberTicketDetailResponse.Seat(seat.seatId(), seat.rowName(),
                                seat.number(), seat.type(), seat.price())).toList(),
                booking.subtotal(), booking.discountAmount(), booking.totalAmount(), "VND",
                new MemberTicketDetailResponse.Recipient(recipient.name(), recipient.email(), recipient.phoneNumber()),
                detail.payments().stream()
                        .map(payment -> new MemberTicketDetailResponse.Payment(payment.method(), payment.amount(),
                                payment.transactionCode(), payment.status(), payment.occurredAt())).toList(),
                now, AppConstants.ZONE.getId());
    }

    private Ticket toTicket(Booking booking) {
        return new Ticket(booking.bookingCode(), booking.createdAt(), booking.paidAt(),
                new MemberTicketListResponse.Movie(booking.movie().id(), booking.movie().title(),
                        booking.movie().posterUrl()),
                new MemberTicketListResponse.Showtime(booking.showtime().id(), booking.showtime().startsAt(),
                        booking.showtime().roomName(), booking.showtime().cinemaName()),
                booking.seatCount(), booking.totalAmount(), "VND", booking.status(), booking.collectedAt());
    }
}

package com.cgdn.cinema.modules.ticket.service;

import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.common.response.PageResponse;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
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

    private Ticket toTicket(Booking booking) {
        return new Ticket(booking.bookingCode(), booking.createdAt(), booking.paidAt(),
                new MemberTicketListResponse.Movie(booking.movie().id(), booking.movie().title(),
                        booking.movie().posterUrl()),
                new MemberTicketListResponse.Showtime(booking.showtime().id(), booking.showtime().startsAt(),
                        booking.showtime().roomName(), booking.showtime().cinemaName()),
                booking.seatCount(), booking.totalAmount(), "VND", booking.status(), booking.collectedAt());
    }
}

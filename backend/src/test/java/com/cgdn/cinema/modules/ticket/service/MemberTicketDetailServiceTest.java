package com.cgdn.cinema.modules.ticket.service;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.ticket.dto.response.MemberTicketDetailResponse;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Booking;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Detail;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Movie;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Payment;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Recipient;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Seat;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Showtime;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class MemberTicketDetailServiceTest {

    private static final long MEMBER_ID = 101L;
    private static final String CODE = "DETAIL-6001";
    private static final LocalDateTime STARTS_AT = LocalDateTime.of(2026, 11, 4, 14, 30);
    private static final LocalDateTime BOOKED_AT = LocalDateTime.of(2026, 11, 1, 10, 0);
    private final MemberTicketReadRepository repository = mock(MemberTicketReadRepository.class);
    private final Clock clock = mock(Clock.class);
    private final MemberTicketService service = new MemberTicketService(repository, clock);

    @Test
    void returnsDatabaseFieldsAndEveryPaymentWithoutRecalculatingTheBookingTotal() {
        var detail = new Detail(booking(STARTS_AT, 166, 2, null),
                new Recipient("Gift Recipient", "gift@example.test", "0900123456"),
                List.of(new Seat(5001, "F", 6, "VIP", new BigDecimal("160000")),
                        new Seat(5002, "F", 7, "VIP", new BigDecimal("160000"))),
                List.of(new Payment(9001, "PAYPAL", new BigDecimal("300000"), "TX-1", "PROVIDER_FAILED",
                                BOOKED_AT.plusMinutes(1)),
                        new Payment(9002, "DB_METHOD", new BigDecimal("300000"), "TX-2", "PROVIDER_OK",
                                BOOKED_AT.plusMinutes(5))));
        given(detail);

        var response = service.getBooking(MEMBER_ID, CODE);

        assertThat(response.bookingCode()).isEqualTo(CODE);
        assertThat(response.channel()).isEqualTo("ONLINE");
        assertThat(response.bookedAt()).isEqualTo(BOOKED_AT);
        assertThat(response.paidAt()).isEqualTo(BOOKED_AT.plusMinutes(5));
        assertThat(response.collectedAt()).isNull();
        assertThat(response.bookingStatus()).isEqualTo("DA_THANH_TOAN");
        assertThat(response.movie()).isEqualTo(new MemberTicketDetailResponse.Movie(
                3001, "Detail Movie", "https://example.test/poster.jpg", 166, "T18"));
        assertThat(response.cinema()).isEqualTo(new MemberTicketDetailResponse.Cinema(
                1001, "Detail Cinema", "123 Detail Street"));
        assertThat(response.room()).isEqualTo(new MemberTicketDetailResponse.Room(2001, "Room 01"));
        assertThat(response.showtime()).isEqualTo(new MemberTicketDetailResponse.Showtime(
                4001, STARTS_AT, STARTS_AT.plusMinutes(166)));
        assertThat(response.seatCount()).isEqualTo(2);
        assertThat(response.seats()).containsExactly(
                new MemberTicketDetailResponse.Seat(5001, "F", 6, "VIP", new BigDecimal("160000")),
                new MemberTicketDetailResponse.Seat(5002, "F", 7, "VIP", new BigDecimal("160000")));
        assertThat(response.subtotal()).isEqualByComparingTo("320000");
        assertThat(response.discountAmount()).isEqualByComparingTo("20000");
        assertThat(response.totalAmount()).isEqualByComparingTo("300000");
        assertThat(response.currency()).isEqualTo("VND");
        assertThat(response.recipient()).isEqualTo(new MemberTicketDetailResponse.Recipient(
                "Gift Recipient", "gift@example.test", "0900123456"));
        assertThat(response.payments()).containsExactly(
                new MemberTicketDetailResponse.Payment("PAYPAL", new BigDecimal("300000"), "TX-1",
                        "PROVIDER_FAILED", BOOKED_AT.plusMinutes(1)),
                new MemberTicketDetailResponse.Payment("DB_METHOD", new BigDecimal("300000"), "TX-2",
                        "PROVIDER_OK", BOOKED_AT.plusMinutes(5)));
        assertThat(response.serverTime()).isEqualTo(STARTS_AT);
        assertThat(response.timeZone()).isEqualTo("Asia/Ho_Chi_Minh");
        verify(repository).findPaidBookingByCodeAndUserId(CODE, MEMBER_ID);
        verifyNoMoreInteractions(repository);
        verify(clock).instant();
        verifyNoMoreInteractions(clock);
    }

    @ParameterizedTest
    @CsvSource({"2026-11-04T14:30:00,166,2026-11-04T17:16:00",
            "2026-11-04T23:30:00,166,2026-11-05T02:16:00",
            "2026-12-31T23:30:00,90,2027-01-01T01:00:00",
            "2028-02-28T23:30:00,90,2028-02-29T01:00:00"})
    void calculatesMovieEndWithoutCleanupTimeIncludingDateBoundaries(String startsAt, int duration, String endsAt) {
        var booking = booking(LocalDateTime.parse(startsAt), duration, 0, null);
        given(new Detail(booking, new Recipient(null, null, null), List.of(), List.of()));

        var response = service.getBooking(MEMBER_ID, CODE);

        assertThat(response.showtime().endsAt()).isEqualTo(LocalDateTime.parse(endsAt));
        assertThat(response.showtime().endsAt()).isNotEqualTo(booking.showtime().scheduledEndsAt());
    }

    @Test
    void preservesNullRecipientFieldsAndSeatPriceWithoutFallbackData() {
        given(new Detail(booking(STARTS_AT, 166, 1, null), new Recipient(null, null, null),
                List.of(new Seat(5001, "F", 6, "VIP", null)), List.of()));

        var response = service.getBooking(MEMBER_ID, CODE);

        assertThat(response.recipient()).isEqualTo(new MemberTicketDetailResponse.Recipient(null, null, null));
        assertThat(response.seats()).singleElement().satisfies(seat -> assertThat(seat.price()).isNull());
        assertThat(response.payments()).isEmpty();
        assertThat(response.collectedAt()).isNull();
        assertThat(response.totalAmount()).isEqualByComparingTo("300000");
    }

    @Test
    void preservesEmptySeatAndPaymentListsAndAnExistingCollectionTime() {
        LocalDateTime collectedAt = STARTS_AT.minusMinutes(10);
        given(new Detail(booking(STARTS_AT, 166, 0, collectedAt), new Recipient(null, null, null),
                List.of(), List.of()));

        var response = service.getBooking(MEMBER_ID, CODE);

        assertThat(response.seatCount()).isZero();
        assertThat(response.seats()).isEmpty();
        assertThat(response.payments()).isEmpty();
        assertThat(response.collectedAt()).isEqualTo(collectedAt);
        assertThat(response.bookingStatus()).isEqualTo("DA_THANH_TOAN");
    }

    @ParameterizedTest
    @ValueSource(strings = {"MISSING", "OTHER-6001", "UNPAID-6001"})
    void reportsTheSameNotFoundWhenTheScopedRepositoryReturnsNoBooking(String code) {
        when(repository.findPaidBookingByCodeAndUserId(code, MEMBER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getBooking(MEMBER_ID, code))
                .isInstanceOfSatisfying(BusinessException.class, exception -> {
                    assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND);
                    assertThat(exception.getMessage()).isEqualTo("Không tìm thấy vé đã mua.");
                });
        verify(repository).findPaidBookingByCodeAndUserId(code, MEMBER_ID);
        verifyNoMoreInteractions(repository);
        verifyNoInteractions(clock);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t", "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"})
    void returnsNotFoundForEmptyOrOversizedCodesWithoutAnUnscopedQuery(String code) {
        assertThatThrownBy(() -> service.getBooking(MEMBER_ID, code))
                .isInstanceOfSatisfying(BusinessException.class, exception -> {
                    assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND);
                    assertThat(exception.getMessage()).isEqualTo("Không tìm thấy vé đã mua.");
                });
        verifyNoInteractions(repository, clock);
    }

    private void given(Detail detail) {
        when(repository.findPaidBookingByCodeAndUserId(CODE, MEMBER_ID)).thenReturn(Optional.of(detail));
        when(clock.instant()).thenReturn(Instant.parse("2026-11-04T07:30:00Z"));
    }

    private Booking booking(LocalDateTime startsAt, int duration, long seatCount, LocalDateTime collectedAt) {
        return new Booking(6001, CODE, "ONLINE", BOOKED_AT, BOOKED_AT.plusMinutes(5), collectedAt,
                "DA_THANH_TOAN", new BigDecimal("320000"), new BigDecimal("20000"), new BigDecimal("300000"),
                seatCount, new Movie(3001, "Detail Movie", "https://example.test/poster.jpg", duration, "T18"),
                new Showtime(4001, startsAt, startsAt.plusMinutes(duration + 15), 2001, "Room 01",
                        1001, "Detail Cinema", "123 Detail Street"));
    }
}

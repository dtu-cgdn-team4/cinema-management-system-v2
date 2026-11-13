package com.cgdn.cinema.modules.ticket.service;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Booking;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.BookingView;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Counts;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class MemberTicketServiceTest {

    @Test
    void usesOneVietnamTimeSnapshotAndKeepsCountsWhenRequestedPageIsEmpty() {
        var repository = mock(MemberTicketReadRepository.class);
        var clock = mock(Clock.class);
        var instant = Instant.parse("2026-11-04T07:30:00Z");
        var vietnamTime = LocalDateTime.of(2026, 11, 4, 14, 30);
        when(clock.instant()).thenReturn(instant, instant.plusSeconds(1));
        when(repository.countPaidBookingsByUserId(101L, vietnamTime)).thenReturn(new Counts(12, 5, 7));
        when(repository.findPaidBookingsByUserId(101L, 2, 10, BookingView.UPCOMING, vietnamTime))
                .thenReturn(new PageImpl<Booking>(List.of(), PageRequest.of(2, 10), 5));

        var response = new MemberTicketService(repository, clock).getBookings(101L, 2, 10, BookingView.UPCOMING);

        assertThat(response.serverTime()).isEqualTo(vietnamTime);
        assertThat(response.timeZone()).isEqualTo("Asia/Ho_Chi_Minh");
        assertThat(response.tickets().getContent()).isEmpty();
        assertThat(response.tickets().getTotalElements()).isEqualTo(5);
        assertThat(response.counts().all()).isEqualTo(12);
        assertThat(response.counts().upcoming()).isEqualTo(5);
        assertThat(response.counts().history()).isEqualTo(7);
        verify(repository).countPaidBookingsByUserId(101L, vietnamTime);
        verify(repository).findPaidBookingsByUserId(101L, 2, 10, BookingView.UPCOMING, vietnamTime);
        verify(clock).instant();
        verifyNoMoreInteractions(clock);
    }

    @ParameterizedTest
    @CsvSource({"-1,10", "0,0", "0,-1", "0,101"})
    void rejectsInvalidPaginationBeforeDatabaseAccess(int page, int size) {
        var repository = mock(MemberTicketReadRepository.class);
        var clock = mock(Clock.class);

        assertThatThrownBy(() -> new MemberTicketService(repository, clock)
                .getBookings(101L, page, size, BookingView.ALL))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode").isEqualTo(ErrorCode.INVALID_REQUEST);
        verifyNoInteractions(repository, clock);
    }

    @Test
    void rejectsMissingViewBeforeDatabaseAccess() {
        var repository = mock(MemberTicketReadRepository.class);
        var clock = mock(Clock.class);

        assertThatThrownBy(() -> new MemberTicketService(repository, clock).getBookings(101L, 0, 10, null))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(repository, clock);
    }
}

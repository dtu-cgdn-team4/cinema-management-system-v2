package com.cgdn.cinema.modules.booking.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.common.enums.SeatStatus;
import com.cgdn.cinema.common.enums.SeatType;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.booking.dto.response.SeatHoldResponse;
import com.cgdn.cinema.modules.booking.entity.SeatHold;
import com.cgdn.cinema.modules.booking.queue.SeatHoldCommand;
import com.cgdn.cinema.modules.booking.repository.SeatHoldRepository;
import com.cgdn.cinema.modules.pricing.service.PricingService;
import com.cgdn.cinema.modules.room.entity.Seat;
import com.cgdn.cinema.modules.room.service.RoomService;
import com.cgdn.cinema.modules.showtime.dto.response.ShowtimeResponse;
import com.cgdn.cinema.modules.showtime.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Giữ ghế cho một yêu cầu đã qua RabbitMQ. Consumer chạy tuần tự nên trạng thái ghế không đổi giữa lúc
 * kiểm tra quy tắc và lúc ghi; mỗi yêu cầu một transaction, lỗi thì không đổi ghế nào (Q&A #22, #23).
 */
@Service
@RequiredArgsConstructor
public class SeatHoldProcessor {

    private final SeatHoldRepository seatHoldRepository;
    private final ShowtimeService showtimeService;
    private final RoomService roomService;
    private final PricingService pricingService;
    private final Clock clock;

    @Transactional
    public SeatHoldResponse hold(SeatHoldCommand command) {
        ShowtimeResponse showtime = showtimeService.getUpcomingShowtime(command.showtimeId());
        Map<Long, Seat> roomSeats = roomService.getSeats(showtime.room().id()).stream()
                .collect(Collectors.toMap(Seat::getId, Function.identity()));
        List<Seat> chosen = command.seatIds().stream().map(roomSeats::get).toList();
        if (chosen.contains(null)) {
            throw new BusinessException(ErrorCode.SEAT_NOT_FOUND);
        }

        LocalDateTime now = LocalDateTime.now(clock);
        seatHoldRepository.deleteExpiredIn(command.showtimeId(), now);
        // Khách quay lại chọn ghế thì lượt giữ cũ được thay bằng lượt mới.
        seatHoldRepository.deleteHeldBy(command.showtimeId(), command.userId());
        Set<Long> occupied = seatHoldRepository.findActive(command.showtimeId(), now).stream()
                .map(SeatHold::getSeatId)
                .collect(Collectors.toSet());
        Set<Long> selected = Set.copyOf(command.seatIds());
        if (!Collections.disjoint(occupied, selected)) {
            throw new BusinessException(ErrorCode.SEAT_ALREADY_TAKEN);
        }
        if (SeatRuleValidator.leavesSingleGap(roomSeats.values(), occupied, selected)) {
            throw new BusinessException(ErrorCode.SINGLE_SEAT_GAP);
        }

        LocalDateTime expiresAt = now.plusMinutes(AppConstants.SEAT_HOLD_MINUTES);
        try {
            seatHoldRepository.saveAllAndFlush(chosen.stream().map(seat -> newHold(command, seat, expiresAt)).toList());
        } catch (DataIntegrityViolationException ex) {
            // unique (suat_chieu_id, ghe_id): lớp chặn cuối chống bán trùng
            throw new BusinessException(ErrorCode.SEAT_ALREADY_TAKEN);
        }

        Map<SeatType, Long> prices = pricingService.getPricesForDay(showtime.startTime().getDayOfWeek());
        List<SeatHoldResponse.HeldSeat> seats = chosen.stream()
                .map(s -> new SeatHoldResponse.HeldSeat(s.getId(), s.getLabel(), s.getType(), prices.get(s.getType())))
                .toList();
        long total = seats.stream().mapToLong(SeatHoldResponse.HeldSeat::price).sum();
        return new SeatHoldResponse(command.showtimeId(), expiresAt, seats, total);
    }

    private static SeatHold newHold(SeatHoldCommand command, Seat seat, LocalDateTime expiresAt) {
        SeatHold hold = new SeatHold();
        hold.setShowtimeId(command.showtimeId());
        hold.setSeatId(seat.getId());
        hold.setUserId(command.userId());
        hold.setStatus(SeatStatus.DANG_GIU);
        hold.setExpiresAt(expiresAt);
        return hold;
    }
}

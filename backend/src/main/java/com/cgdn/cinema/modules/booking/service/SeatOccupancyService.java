package com.cgdn.cinema.modules.booking.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;
import com.cgdn.cinema.modules.booking.repository.SeatHoldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Đếm ghế đã có người cho module khác (showtime), tách riêng để không phụ thuộc vòng với SeatHoldService. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeatOccupancyService {

    private final SeatHoldRepository seatHoldRepository;
    private final Clock clock;

    public Map<Long, Integer> countTakenSeats(Collection<Long> showtimeIds) {
        if (showtimeIds.isEmpty()) {
            return Map.of();
        }
        return seatHoldRepository.countActiveByShowtime(showtimeIds, LocalDateTime.now(clock)).stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> ((Long) r[1]).intValue()));
    }
}

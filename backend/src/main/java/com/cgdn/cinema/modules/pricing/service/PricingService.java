package com.cgdn.cinema.modules.pricing.service;

import java.time.DayOfWeek;
import java.util.Map;
import java.util.stream.Collectors;
import com.cgdn.cinema.common.enums.SeatType;
import com.cgdn.cinema.modules.pricing.entity.TicketPrice;
import com.cgdn.cinema.modules.pricing.repository.TicketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PricingService {

    private final TicketPriceRepository ticketPriceRepository;

    /** Giá theo thứ trong tuần của một loại ghế (Q&A #34: khung giờ không ảnh hưởng giá). */
    public Map<DayOfWeek, Long> getPricesByDay(SeatType seatType) {
        return ticketPriceRepository.findBySeatType(seatType).stream()
                .collect(Collectors.toMap(p -> DayOfWeek.of(p.getDayOfWeek()), p -> p.getPrice().longValue()));
    }
}

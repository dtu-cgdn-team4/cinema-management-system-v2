package com.cgdn.cinema.modules.pricing.service;

import java.time.DayOfWeek;
import java.util.EnumMap;
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

    /** Giá từng loại ghế trong một ngày. */
    public Map<SeatType, Long> getPricesForDay(DayOfWeek day) {
        Map<SeatType, Long> prices = new EnumMap<>(SeatType.class);
        ticketPriceRepository.findAll().stream()
                .filter(p -> p.getDayOfWeek() == day.getValue())
                .forEach(p -> prices.put(p.getSeatType(), p.getPrice().longValue()));
        // ponytail: giá VIP chưa chốt (business-rules "Câu hỏi còn mở"), tạm lấy giá ghế thường
        prices.putIfAbsent(SeatType.VIP, prices.get(SeatType.THUONG));
        return prices;
    }
}

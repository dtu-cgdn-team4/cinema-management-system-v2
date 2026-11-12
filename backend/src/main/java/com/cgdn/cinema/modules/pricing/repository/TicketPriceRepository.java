package com.cgdn.cinema.modules.pricing.repository;

import java.util.List;
import com.cgdn.cinema.common.enums.SeatType;
import com.cgdn.cinema.modules.pricing.entity.TicketPrice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketPriceRepository extends JpaRepository<TicketPrice, Long> {

    List<TicketPrice> findBySeatType(SeatType seatType);
}

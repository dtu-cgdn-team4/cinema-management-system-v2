package com.cgdn.cinema.modules.booking.scheduler;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import com.cgdn.cinema.modules.booking.repository.SeatHoldRepository;
import com.cgdn.cinema.modules.booking.service.SeatStatusPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Nhả ghế giữ quá 10 phút và báo cho người đang xem suất (architecture.md, luồng đặt vé bước 7). */
@Component
@RequiredArgsConstructor
public class SeatHoldReleaseJob {

    private final SeatHoldRepository seatHoldRepository;
    private final SeatStatusPublisher seatStatusPublisher;
    private final Clock clock;

    /** Sơ đồ ghế coi ghế quá hạn là trống ngay khi hết hạn; job dọn bản ghi và đẩy cập nhật, trễ tối đa 30 giây. */
    @Scheduled(fixedDelay = 30, timeUnit = TimeUnit.SECONDS)
    public void releaseExpiredHolds() {
        LocalDateTime now = LocalDateTime.now(clock);
        List<Long> showtimeIds = seatHoldRepository.findShowtimesWithExpiredHolds(now);
        if (showtimeIds.isEmpty()) {
            return;
        }
        seatHoldRepository.deleteExpired(now);
        showtimeIds.forEach(seatStatusPublisher::publish);
    }
}

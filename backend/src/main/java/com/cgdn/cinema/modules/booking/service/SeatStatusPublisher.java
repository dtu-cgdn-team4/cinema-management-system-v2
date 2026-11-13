package com.cgdn.cinema.modules.booking.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import com.cgdn.cinema.modules.booking.dto.response.SeatStatusMessage;
import com.cgdn.cinema.modules.booking.entity.SeatHold;
import com.cgdn.cinema.modules.booking.repository.SeatHoldRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/** Đẩy trạng thái ghế của một suất qua WebSocket cho người đang xem sơ đồ (architecture.md, luồng đặt vé bước 4). */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeatStatusPublisher {

    /** Kênh STOMP của một suất chiếu, ví dụ /topic/showtimes/12/seats. */
    public static final String TOPIC = "/topic/showtimes/%d/seats";

    private final SimpMessagingTemplate messagingTemplate;
    private final SeatHoldRepository seatHoldRepository;
    private final Clock clock;

    public void publish(Long showtimeId) {
        try {
            List<Long> taken = seatHoldRepository.findActive(showtimeId, LocalDateTime.now(clock)).stream()
                    .map(SeatHold::getSeatId)
                    .sorted()
                    .toList();
            messagingTemplate.convertAndSend(TOPIC.formatted(showtimeId), new SeatStatusMessage(showtimeId, taken));
        } catch (RuntimeException ex) {
            // Ghế đã lưu xong; lỗi đẩy tin chỉ làm người xem thấy cập nhật chậm hơn.
            log.warn("Không đẩy được trạng thái ghế của suất {}", showtimeId, ex);
        }
    }
}

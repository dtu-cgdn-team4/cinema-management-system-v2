package com.cgdn.cinema.modules.booking.queue;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.infrastructure.messaging.RabbitConfig;
import com.cgdn.cinema.modules.booking.service.SeatHoldProcessor;
import com.cgdn.cinema.modules.booking.service.SeatStatusPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/** Consumer hàng đợi giữ ghế (architecture.md, luồng đặt vé bước 3). */
@Slf4j
@Component
@RequiredArgsConstructor
public class SeatHoldListener {

    private final SeatHoldProcessor seatHoldProcessor;
    private final SeatStatusPublisher seatStatusPublisher;

    /**
     * Một consumer (concurrency 1) nên các yêu cầu giữ ghế xử lý lần lượt: hai khách chọn cùng ghế thì người
     * đến trước giữ được, người sau nhận SEAT_ALREADY_TAKEN (business-rules "Quy tắc chọn ghế" mục 6).
     * ponytail: một hàng đợi chung cho mọi suất; tách hàng đợi theo suất nếu cần thông lượng cao hơn.
     */
    @RabbitListener(queues = RabbitConfig.SEAT_HOLD_QUEUE, concurrency = "1")
    public SeatHoldReply handle(SeatHoldCommand command) {
        SeatHoldProcessor.Outcome outcome;
        try {
            outcome = seatHoldProcessor.hold(command);
        } catch (BusinessException ex) {
            return new SeatHoldReply(null, ex.getErrorCode());
        } catch (RuntimeException ex) {
            log.error("Giữ ghế thất bại: {}", command, ex);
            return new SeatHoldReply(null, ErrorCode.INTERNAL_ERROR);
        }
        // Transaction đã commit: báo trạng thái ghế mới cho người đang xem suất này và các suất vừa được nhả ghế.
        outcome.changedShowtimeIds().forEach(seatStatusPublisher::publish);
        return new SeatHoldReply(outcome.response(), null);
    }
}

package com.cgdn.cinema.modules.booking.service;

import java.util.HashSet;
import java.util.List;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.infrastructure.messaging.RabbitConfig;
import com.cgdn.cinema.modules.booking.dto.request.SeatHoldRequest;
import com.cgdn.cinema.modules.booking.dto.response.SeatHoldResponse;
import com.cgdn.cinema.modules.booking.queue.SeatHoldCommand;
import com.cgdn.cinema.modules.booking.queue.SeatHoldReply;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

/**
 * Nhận yêu cầu giữ ghế: kiểm tra số lượng, đẩy vào RabbitMQ (Q&A #14) rồi chờ consumer trả kết quả.
 * Quy tắc phụ thuộc trạng thái ghế kiểm tra ở SeatHoldProcessor, trong consumer.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeatHoldService {

    private final RabbitTemplate rabbitTemplate;

    public SeatHoldResponse hold(Long userId, Long showtimeId, SeatHoldRequest request) {
        validateCount(request.quantity(), request.seatIds());

        SeatHoldReply reply;
        try {
            reply = rabbitTemplate.convertSendAndReceiveAsType(RabbitConfig.SEAT_HOLD_QUEUE,
                    new SeatHoldCommand(userId, showtimeId, request.seatIds()),
                    new ParameterizedTypeReference<SeatHoldReply>() {
                    });
        } catch (AmqpException ex) {
            log.error("Không gửi được yêu cầu giữ ghế tới RabbitMQ", ex);
            throw new BusinessException(ErrorCode.SYSTEM_BUSY);
        }
        if (reply == null) {
            // Quá spring.rabbitmq.template.reply-timeout mà consumer chưa trả lời.
            throw new BusinessException(ErrorCode.SYSTEM_BUSY);
        }
        if (reply.errorCode() != null) {
            throw new BusinessException(reply.errorCode());
        }
        return reply.result();
    }

    /** Quy tắc chọn ghế 1 và 2 (business-rules): số lượng 1–8, số ghế chọn phải bằng số lượng (SRS 6.2.2). */
    static void validateCount(int quantity, List<Long> seatIds) {
        int max = AppConstants.MAX_SEATS_PER_BOOKING;
        if (quantity < 1 || quantity > max) {
            throw new BusinessException(ErrorCode.SEAT_QUANTITY_INVALID, max);
        }
        if (new HashSet<>(seatIds).size() != seatIds.size()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        if (seatIds.size() < quantity) {
            throw new BusinessException(ErrorCode.SEAT_COUNT_MISSING, quantity - seatIds.size());
        }
        if (seatIds.size() > quantity) {
            throw new BusinessException(ErrorCode.SEAT_COUNT_EXCEEDED, quantity);
        }
    }
}

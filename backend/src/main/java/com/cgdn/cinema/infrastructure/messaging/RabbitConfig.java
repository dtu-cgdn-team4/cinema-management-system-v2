package com.cgdn.cinema.infrastructure.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** RabbitMQ cho luồng đặt vé (Q&A #14); kết nối lấy từ biến RABBITMQ_* trong .env. */
@Configuration
public class RabbitConfig {

    /** Hàng đợi yêu cầu giữ ghế. */
    public static final String SEAT_HOLD_QUEUE = "booking.seat-hold";

    @Bean
    public Queue seatHoldQueue() {
        return new Queue(SEAT_HOLD_QUEUE);
    }

    /** Tin nhắn dạng JSON, dùng ObjectMapper của Spring để ngày giờ giống REST. */
    @Bean
    public MessageConverter jsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}

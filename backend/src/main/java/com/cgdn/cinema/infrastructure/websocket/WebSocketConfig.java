package com.cgdn.cinema.infrastructure.websocket;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP qua WebSocket: client kết nối ws://host:8080/api/v1/showtimes/ws rồi đăng ký
 * /topic/showtimes/{showtimeId}/seats để nhận trạng thái ghế mới khi có người giữ hoặc ghế được nhả.
 * Chỉ server được đẩy tin.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /** Nằm dưới GET /api/v1/showtimes/** mà SecurityConfig cho xem không cần đăng nhập. */
    public static final String ENDPOINT = "/api/v1/showtimes/ws";

    @Value("${app.websocket.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(ENDPOINT).setAllowedOriginPatterns(allowedOrigins);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
    }

    /** Bỏ frame SEND từ client, nếu không simple broker sẽ phát tin giả lên /topic cho mọi người đang xem. */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                return accessor != null && StompCommand.SEND.equals(accessor.getCommand()) ? null : message;
            }
        });
    }
}

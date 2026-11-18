package com.cgdn.cinema.security;

import com.cgdn.cinema.common.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/** Limits password login attempts to ten requests per IP in any rolling minute. */
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/v1/auth/login";
    private static final int REQUEST_LIMIT = 10;
    private static final long WINDOW_MILLIS = 60_000L;
    private static final long WINDOW_NANOS = WINDOW_MILLIS * 1_000_000L;
    private static final int CLEANUP_INTERVAL = 256;

    private final ObjectMapper objectMapper;
    private final Map<String, RequestWindow> windows = new ConcurrentHashMap<>();
    private final AtomicLong requestsSinceCleanup = new AtomicLong();

    public LoginRateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equalsIgnoreCase(request.getMethod())
                || !LOGIN_PATH.equals(request.getServletPath());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long now = System.nanoTime();
        String clientIp = request.getRemoteAddr();
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = "unknown";
        }

        String key = clientIp;
        AtomicReference<RequestDecision> decisionReference = new AtomicReference<>();
        windows.compute(key, (ip, window) -> {
            RequestWindow current = window == null ? new RequestWindow() : window;
            decisionReference.set(current.record(now));
            return current;
        });
        RequestDecision decision = decisionReference.get();

        if (requestsSinceCleanup.incrementAndGet() % CLEANUP_INTERVAL == 0) {
            removeExpiredWindows(now);
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(REQUEST_LIMIT));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(decision.remaining()));

        if (!decision.allowed()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(decision.retryAfterSeconds()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            objectMapper.writeValue(response.getOutputStream(), ApiResponse.error(
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    "RATE_LIMIT_EXCEEDED",
                    "Bạn đã gửi quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau."));
            return;
        }
        filterChain.doFilter(request, response);
    }

    private void removeExpiredWindows(long now) {
        windows.forEach((ip, window) -> windows.computeIfPresent(ip,
                (key, current) -> current == window && current.isExpired(now) ? null : current));
    }

    private static final class RequestWindow {
        private final ArrayDeque<Long> requestTimes = new ArrayDeque<>();

        private synchronized RequestDecision record(long now) {
            discardExpiredRequests(now);
            if (requestTimes.size() >= REQUEST_LIMIT) {
                long retryAfterNanos = WINDOW_NANOS - (now - requestTimes.peekFirst());
                long retryAfterSeconds = Math.max(1L,
                        (retryAfterNanos + 999_999_999L) / 1_000_000_000L);
                return new RequestDecision(false, 0, retryAfterSeconds);
            }

            requestTimes.addLast(now);
            return new RequestDecision(true, REQUEST_LIMIT - requestTimes.size(), 0);
        }

        private synchronized boolean isExpired(long now) {
            discardExpiredRequests(now);
            return requestTimes.isEmpty();
        }

        private void discardExpiredRequests(long now) {
            while (!requestTimes.isEmpty() && now - requestTimes.peekFirst() >= WINDOW_NANOS) {
                requestTimes.removeFirst();
            }
        }
    }

    private record RequestDecision(boolean allowed, int remaining, long retryAfterSeconds) {
    }
}

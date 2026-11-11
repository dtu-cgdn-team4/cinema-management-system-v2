package com.cgdn.cinema.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Cấu hình múi giờ chuẩn Asia/Ho_Chi_Minh cho toàn bộ xử lý thời gian nghiệp vụ.
 */
@Configuration
public class TimeConfig {

    public static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Bean
    public Clock appClock() {
        return Clock.system(VIETNAM_ZONE);
    }
}


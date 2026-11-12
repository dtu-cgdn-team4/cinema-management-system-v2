package com.cgdn.cinema.config;

import java.time.Clock;
import com.cgdn.cinema.common.constants.AppConstants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClockConfig {

    /** Đồng hồ theo giờ Việt Nam; test có thể thay bằng Clock.fixed. */
    @Bean
    public Clock clock() {
        return Clock.system(AppConstants.ZONE);
    }
}

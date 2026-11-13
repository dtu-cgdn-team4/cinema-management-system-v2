package com.cgdn.cinema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Bật @Scheduled, dùng cho SeatHoldReleaseJob. */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}

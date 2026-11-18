package com.cgdn.cinema.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            flyway.repair(); // Bước 1: Tự động dọn sạch các bản ghi lỗi cũ trong MySQL
            flyway.migrate(); // Bước 2: Chạy tiếp nạp dữ liệu SQL mới vào
        };
    }
}

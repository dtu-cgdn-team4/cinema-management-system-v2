package com.cgdn.cinema.config;

import java.time.Clock;
import com.cgdn.cinema.common.constants.AppConstants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors-origins}")
    private String[] corsOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(corsOrigins).allowedMethods("*");
    }

    /** Đồng hồ theo giờ Việt Nam; test có thể thay bằng Clock.fixed. */
    @Bean
    public Clock clock() {
        return Clock.system(AppConstants.ZONE);
    }
}

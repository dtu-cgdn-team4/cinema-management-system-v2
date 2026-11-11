package com.cgdn.cinema;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CinemaManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(CinemaManagementApplication.class, args);
    }
}

package com.cgdn.cinema.modules.cinema.dto.response;

import java.time.LocalTime;

public record CinemaResponse(
        Long id,
        String name,
        String city,
        String address,
        String phone,
        LocalTime openTime,
        LocalTime closeTime,
        String imageUrl) {
}

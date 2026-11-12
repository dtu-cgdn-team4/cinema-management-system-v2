package com.cgdn.cinema.modules.cinema.mapper;

import com.cgdn.cinema.modules.cinema.dto.response.CinemaResponse;
import com.cgdn.cinema.modules.cinema.entity.Cinema;

public final class CinemaMapper {

    private CinemaMapper() {
    }

    public static CinemaResponse toResponse(Cinema c) {
        return new CinemaResponse(c.getId(), c.getName(), c.getCity(), c.getAddress(), c.getPhone(),
                c.getOpenTime(), c.getCloseTime(), c.getImageUrl());
    }
}

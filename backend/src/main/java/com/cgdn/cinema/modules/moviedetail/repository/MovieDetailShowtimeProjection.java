package com.cgdn.cinema.modules.moviedetail.repository;

import java.time.LocalDateTime;

public interface MovieDetailShowtimeProjection {

    Long getId();

    Long getRoomId();

    String getRoomName();

    Long getCinemaId();

    String getCinemaName();

    String getCinemaCity();

    String getCinemaAddress();

    LocalDateTime getStartsAt();

    LocalDateTime getEndsAt();
}

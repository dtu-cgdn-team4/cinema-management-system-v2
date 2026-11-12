package com.cgdn.cinema.modules.moviedetail.repository;

public interface MovieDetailAvailabilityProjection extends MovieDetailShowtimeProjection {
    Long getTotalSeats();

    Long getOccupiedSeats();
}

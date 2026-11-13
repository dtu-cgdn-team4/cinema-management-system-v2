package com.cgdn.cinema.modules.moviedetail.exception;

public class MovieDetailNotFoundException extends RuntimeException {

    public MovieDetailNotFoundException(Long movieId) {
        super("Không tìm thấy phim với ID: " + movieId);
    }
}

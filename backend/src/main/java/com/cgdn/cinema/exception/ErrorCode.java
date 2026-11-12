package com.cgdn.cinema.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Mã lỗi nghiệp vụ tập trung, mỗi giá trị chứa HTTP status và thông điệp tiếng Việt.
 */
@Getter
public enum ErrorCode {

    // Chung 
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên yêu cầu"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Yêu cầu không hợp lệ"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi hệ thống"),

    // Phim
    MOVIE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy phim"),
    GENRE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy thể loại phim");

    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }
}

package com.cgdn.cinema.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Dữ liệu đăng ký không hợp lệ."),
    USERNAME_EXISTS(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại."),
    EMAIL_EXISTS(HttpStatus.CONFLICT, "Email đã tồn tại."),
    PHONE_EXISTS(HttpStatus.CONFLICT, "Số điện thoại đã tồn tại.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus status() { return status; }
    public String message() { return message; }
}

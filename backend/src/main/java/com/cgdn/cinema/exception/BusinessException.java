package com.cgdn.cinema.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String field;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.field = null;
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.field = null;
    }

    public BusinessException(ErrorCode errorCode, String field, String message) {
        super(message);
        this.errorCode = errorCode;
        this.field = field;
    }

    public static BusinessException forField(ErrorCode errorCode, String field) {
        return new BusinessException(errorCode, field, errorCode.getMessage());
    }

    public String field() {
        return field;
    }

    /** args điền vào các %d của message, ví dụ BusinessException(SEAT_COUNT_MISSING, 2). */
    public BusinessException(ErrorCode errorCode, Object... args) {
        super(errorCode.getMessage().formatted(args));
        this.errorCode = errorCode;
        this.field = null;
    }
}

package com.cgdn.cinema.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    /** args điền vào các %d của message, ví dụ BusinessException(SEAT_COUNT_MISSING, 2). */
    public BusinessException(ErrorCode errorCode, Object... args) {
        super(errorCode.getMessage().formatted(args));
        this.errorCode = errorCode;
    }
}

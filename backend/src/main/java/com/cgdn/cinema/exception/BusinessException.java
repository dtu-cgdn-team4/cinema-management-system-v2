package com.cgdn.cinema.exception;

public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    private final String field;

    public BusinessException(ErrorCode errorCode, String field) {
        this(errorCode, field, errorCode.message());
    }

    public BusinessException(ErrorCode errorCode, String field, String message) {
        super(message);
        this.errorCode = errorCode;
        this.field = field;
    }

    public ErrorCode errorCode() { return errorCode; }
    public String field() { return field; }
}

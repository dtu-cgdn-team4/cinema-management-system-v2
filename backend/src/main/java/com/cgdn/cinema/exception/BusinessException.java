package com.cgdn.cinema.exception;

import lombok.Getter;

/**
 * Exception nghiệp vụ, ném khi quy tắc kinh doanh bị vi phạm.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
    }
}

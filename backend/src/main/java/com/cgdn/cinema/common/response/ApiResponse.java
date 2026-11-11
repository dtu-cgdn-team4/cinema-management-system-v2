package com.cgdn.cinema.common.response;

/** Vỏ chung của mọi response, xem docs/api/api-conventions.md. */
public record ApiResponse<T>(boolean success, T data, String message, String errorCode) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return new ApiResponse<>(false, null, message, errorCode);
    }
}

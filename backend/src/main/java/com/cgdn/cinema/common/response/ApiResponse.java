package com.cgdn.cinema.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(int code, String message, T data, Map<String, String> errors) {
    public static <T> ApiResponse<T> success(int code, String message, T data) {
        return new ApiResponse<>(code, message, data, null);
    }

    public static ApiResponse<Void> error(int code, String message, Map<String, String> errors) {
        return new ApiResponse<>(code, message, null, errors);
    }
}

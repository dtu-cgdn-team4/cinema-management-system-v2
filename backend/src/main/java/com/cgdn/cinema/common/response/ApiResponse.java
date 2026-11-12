package com.cgdn.cinema.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private int code;
    private String errorCode;
    private String message;
    private T data;
    private Map<String, String> errors;

    public static <T> ApiResponse<T> success(int code, String message, T data) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message("Thành công")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .build();
    }

    public static ApiResponse<Void> error(int code, String message, Map<String, String> errors) {
        return ApiResponse.<Void>builder()
                .code(code)
                .message(message)
                .errors(errors)
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String errorCode, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .errorCode(errorCode)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String errorCode, String message, T data) {
        return ApiResponse.<T>builder()
                .code(code)
                .errorCode(errorCode)
                .message(message)
                .data(data)
                .build();
    }
}

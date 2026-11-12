package com.cgdn.cinema.exception;

import com.cgdn.cinema.common.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/** Chuyển lỗi thành ApiResponse: code là HTTP status, message hiển thị được cho người dùng. */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private static final String REGISTRATION_PATH = "/api/v1/auth/register";
    private static final String REGISTRATION_VALIDATION_MESSAGE = "Dữ liệu đăng ký không hợp lệ.";
    private final ObjectMapper objectMapper;

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException ex) {
        ErrorCode code = ex.getErrorCode();
        // Lỗi đăng ký vẫn trả errors theo tên trường; các API đăng nhập giữ errorCode như trên develop.
        if (ex.field() != null) {
            return ResponseEntity.status(code.getStatus())
                    .body(ApiResponse.error(code.getStatus().value(), ex.getMessage(),
                            Map.of(ex.field(), ex.getMessage())));
        }
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.error(code.getStatus().value(), code.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        if (isRegistration(request)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, REGISTRATION_VALIDATION_MESSAGE, fieldErrors));
        }
        ErrorCode code = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.error(code.getStatus().value(), code.getCode(), code.getMessage(), fieldErrors));
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(Exception ex, HttpServletRequest request) {
        if (ex instanceof HttpMessageNotReadableException && isRegistration(request)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, REGISTRATION_VALIDATION_MESSAGE));
        }
        return toResponse(ErrorCode.INVALID_REQUEST);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException ex) {
        ErrorCode code = ErrorCode.INVALID_REQUEST;
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.error(code.getStatus().value(), code.getCode(),
                        "Thiếu tham số bắt buộc: " + ex.getParameterName()));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(405)
                .body(ApiResponse.error(405, "METHOD_NOT_ALLOWED", "Phương thức HTTP không được hỗ trợ"));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoResourceFoundException ex) {
        return toResponse(ErrorCode.NOT_FOUND);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        return toResponse(ErrorCode.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return toResponse(ErrorCode.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex) {
        log.error("Unhandled error", ex);
        return toResponse(ErrorCode.INTERNAL_ERROR);
    }

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        writeSecurityError(response, ErrorCode.UNAUTHORIZED);
    }

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        writeSecurityError(response, ErrorCode.FORBIDDEN);
    }

    private ResponseEntity<ApiResponse<Void>> toResponse(ErrorCode code) {
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.error(code.getStatus().value(), code.getCode(), code.getMessage()));
    }

    private boolean isRegistration(HttpServletRequest request) {
        return REGISTRATION_PATH.equals(request.getRequestURI());
    }

    private void writeSecurityError(HttpServletResponse response, ErrorCode code) throws IOException {
        response.setStatus(code.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getWriter(),
                ApiResponse.error(code.getStatus().value(), code.getCode(), code.getMessage()));
    }
}

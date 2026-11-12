package com.cgdn.cinema.exception;

import org.springframework.http.HttpStatus;

/**
 * Danh sách mã lỗi nghiệp vụ và HTTP status tương ứng.
 */
public enum ErrorCode {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Yêu cầu không đúng định dạng"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Tài khoản hoặc mật khẩu không chính xác"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"),
    ACCOUNT_LOCKED(HttpStatus.LOCKED, "ACCOUNT_LOCKED", "Tài khoản đã bị khóa do đăng nhập sai quá số lần quy định"),
    ACCOUNT_DISABLED(HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED", "Tài khoản đã ngừng hoạt động"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"),
    GOOGLE_AUTH_NOT_CONFIGURED(HttpStatus.SERVICE_UNAVAILABLE, "GOOGLE_AUTH_NOT_CONFIGURED",
            "Đăng nhập Google chưa được cấu hình trên hệ thống"),
    INVALID_GOOGLE_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_GOOGLE_TOKEN",
            "Google token không hợp lệ hoặc đã hết hạn"),
    INVALID_GOOGLE_STATE(HttpStatus.UNAUTHORIZED, "INVALID_GOOGLE_STATE",
            "Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn"),
    GOOGLE_EMAIL_UNVERIFIED(HttpStatus.UNAUTHORIZED, "GOOGLE_EMAIL_UNVERIFIED",
            "Email Google chưa được xác minh"),
    GOOGLE_ACCOUNT_MISMATCH(HttpStatus.CONFLICT, "GOOGLE_ACCOUNT_MISMATCH",
            "Email này đã được liên kết với một tài khoản Google khác"),
    GOOGLE_PASSWORD_NOT_SET(HttpStatus.BAD_REQUEST, "GOOGLE_PASSWORD_NOT_SET",
            "Tài khoản này đăng nhập bằng Google và chưa thiết lập mật khẩu"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Lỗi hệ thống nội bộ");

    private final HttpStatus status;
    private final String code;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String code, String defaultMessage) {
        this.status = status;
        this.code = code;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}


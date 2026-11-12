package com.cgdn.cinema.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Dữ liệu đầu vào không hợp lệ"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy đường dẫn"),
    MOVIE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy phim đang chiếu"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"),
    ACCOUNT_LOCKED(HttpStatus.LOCKED, "Tài khoản đã bị khóa do đăng nhập sai quá số lần quy định"),
    ACCOUNT_DISABLED(HttpStatus.FORBIDDEN, "Tài khoản đã ngừng hoạt động"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này"),
    GOOGLE_AUTH_NOT_CONFIGURED(HttpStatus.SERVICE_UNAVAILABLE, "Đăng nhập Google chưa được cấu hình trên hệ thống"),
    INVALID_GOOGLE_TOKEN(HttpStatus.UNAUTHORIZED, "Google token không hợp lệ hoặc đã hết hạn"),
    INVALID_GOOGLE_STATE(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn"),
    GOOGLE_EMAIL_UNVERIFIED(HttpStatus.UNAUTHORIZED, "Email Google chưa được xác minh"),
    GOOGLE_ACCOUNT_MISMATCH(HttpStatus.CONFLICT, "Email này đã được liên kết với một tài khoản Google khác"),
    GOOGLE_PASSWORD_NOT_SET(HttpStatus.BAD_REQUEST, "Tài khoản này đăng nhập bằng Google và chưa thiết lập mật khẩu"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống, vui lòng thử lại sau");

    private final HttpStatus status;
    private final String message;

    public String getCode() {
        return name();
    }

    public String getDefaultMessage() {
        return message;
    }
}

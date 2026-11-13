package com.cgdn.cinema.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/** Message có %d thì truyền tham số qua BusinessException. */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Dữ liệu đầu vào không hợp lệ"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy đường dẫn"),
    MOVIE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy phim đang chiếu"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác"),
    CURRENT_PASSWORD_INVALID(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác"),
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
    USERNAME_EXISTS(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại."),
    EMAIL_EXISTS(HttpStatus.CONFLICT, "Email đã tồn tại."),
    PHONE_EXISTS(HttpStatus.CONFLICT, "Số điện thoại đã tồn tại."),
    INVALID_PHONE_VERIFICATION(HttpStatus.UNAUTHORIZED, "Xác minh số điện thoại không hợp lệ."),
    SHOWTIME_NOT_FOUND(HttpStatus.NOT_FOUND, "Suất chiếu không tồn tại hoặc đã bắt đầu"),
    SEAT_QUANTITY_INVALID(HttpStatus.BAD_REQUEST, "Số lượng ghế phải từ 1 đến %d"),
    SEAT_COUNT_MISSING(HttpStatus.BAD_REQUEST, "Bạn chọn thiếu %d ghế"),
    SEAT_COUNT_EXCEEDED(HttpStatus.BAD_REQUEST, "Bạn chỉ chọn %d ghế"),
    SEAT_NOT_FOUND(HttpStatus.BAD_REQUEST, "Ghế không thuộc phòng chiếu của suất này"),
    SINGLE_SEAT_GAP(HttpStatus.BAD_REQUEST, "Không được để lại một ghế trống lẻ cạnh ghế bạn chọn"),
    SEAT_ALREADY_TAKEN(HttpStatus.CONFLICT, "Ghế bạn chọn đã có người giữ hoặc đã bán, vui lòng chọn ghế khác"),
    SYSTEM_BUSY(HttpStatus.SERVICE_UNAVAILABLE, "Hệ thống đang bận, vui lòng thử lại"),
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

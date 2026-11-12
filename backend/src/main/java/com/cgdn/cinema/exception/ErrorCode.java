package com.cgdn.cinema.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/** Message có %d thì truyền tham số qua BusinessException. */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để đặt vé"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy đường dẫn"),
    MOVIE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy phim đang chiếu"),
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
}

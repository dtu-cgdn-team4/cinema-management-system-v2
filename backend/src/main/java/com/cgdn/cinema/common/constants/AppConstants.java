package com.cgdn.cinema.common.constants;

import java.time.ZoneId;

public final class AppConstants {

    /** Múi giờ nghiệp vụ: lịch chiếu, hạn giữ ghế, doanh thu. */
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    /** Cột trang_thai (xóa mềm): 1 đang hoạt động, 2 đã xóa. */
    public static final int STATUS_ACTIVE = 1;

    /** Số ghế tối đa mỗi lần đặt (Q&A #33). */
    public static final int MAX_SEATS_PER_BOOKING = 8;

    /** Thời gian giữ ghế chờ thanh toán, tính theo giờ server (Q&A #21, #33). */
    public static final int SEAT_HOLD_MINUTES = 10;

    private AppConstants() {
    }
}

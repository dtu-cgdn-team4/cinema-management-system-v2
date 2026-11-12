package com.cgdn.cinema.common.constants;

import java.time.ZoneId;

public final class AppConstants {

    /** Múi giờ nghiệp vụ: lịch chiếu, hạn giữ ghế, doanh thu. */
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    /** Cột trang_thai (xóa mềm): 1 đang hoạt động, 2 đã xóa. */
    public static final int STATUS_ACTIVE = 1;

    private AppConstants() {
    }
}

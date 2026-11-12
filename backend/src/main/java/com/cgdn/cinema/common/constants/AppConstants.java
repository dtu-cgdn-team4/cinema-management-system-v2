package com.cgdn.cinema.common.constants;

/**
 * Hằng số dùng chung toàn hệ thống.
 */
public final class AppConstants {

    private AppConstants() {
        // Utility class
    }

    // Trạng thái xóa mềm
    /** Đang hoạt động */
    public static final int STATUS_ACTIVE = 1;
    /** Đã xóa mềm */
    public static final int STATUS_DELETED = 2;

    // Phân trang mặc định
    public static final int DEFAULT_PAGE = 0;
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 100;
    public static final String DEFAULT_SORT_FIELD = "id";
    public static final String DEFAULT_SORT_DIRECTION = "desc";
}

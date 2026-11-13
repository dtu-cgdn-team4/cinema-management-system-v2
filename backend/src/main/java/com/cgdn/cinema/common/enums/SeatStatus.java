package com.cgdn.cinema.common.enums;

/**
 * Trạng thái ghế trong một suất chiếu (cột trang_thai_ghe); ghế không có bản ghi là ghế trống.
 * Không còn "chờ thanh toán" (business-rules, chốt 06/11/2026).
 */
public enum SeatStatus {
    DANG_GIU, DA_THANH_TOAN
}

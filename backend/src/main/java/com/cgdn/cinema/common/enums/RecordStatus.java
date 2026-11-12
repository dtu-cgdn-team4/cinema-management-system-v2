package com.cgdn.cinema.common.enums;

/**
 * Trạng thái xóa mềm theo quy ước cột trang_thai (1: hoạt động, 2: đã xóa).
 */
public enum RecordStatus {
    ACTIVE(1),
    DELETED(2);

    private final int code;

    RecordStatus(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}


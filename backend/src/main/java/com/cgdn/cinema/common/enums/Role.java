package com.cgdn.cinema.common.enums;

/**
 * Vai trò người dùng khớp cột nguoi_dung.vai_tro (KHACH_HANG, NHAN_VIEN, ADMIN)
 * và ánh xạ sang vai trò phân quyền (USER, STAFF, ADMIN).
 */
public enum Role {
    KHACH_HANG("USER"),
    NHAN_VIEN("STAFF"),
    ADMIN("ADMIN");

    private final String securityRole;

    Role(String securityRole) {
        this.securityRole = securityRole;
    }

    public String getSecurityRole() {
        return securityRole;
    }
}

package com.cgdn.cinema.modules.staff.dto.response;

import com.cgdn.cinema.common.enums.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Dữ liệu nhân viên an toàn trả về cho API quản trị. */
public record StaffResponse(
        Long id,
        String username,
        String fullName,
        String gender,
        LocalDate dateOfBirth,
        String citizenId,
        String phoneNumber,
        String email,
        String address,
        String avatarUrl,
        Long cinemaId,
        Role role,
        Integer status,
        LocalDateTime createdAt
) {
}

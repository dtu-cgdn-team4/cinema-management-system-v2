package com.cgdn.cinema.modules.user.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Dữ liệu công khai cho trang tài khoản; joinedAt lấy từ ngày tạo tài khoản. */
public record AccountProfileResponse(
        String memberCode,
        String username,
        String fullName,
        LocalDate dateOfBirth,
        String gender,
        String email,
        String phoneNumber,
        String citizenId,
        String address,
        Integer loyaltyPoints,
        LocalDateTime joinedAt
) {
}

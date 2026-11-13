package com.cgdn.cinema.modules.user.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

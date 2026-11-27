package com.cgdn.cinema.modules.staff.mapper;

import com.cgdn.cinema.modules.staff.dto.response.StaffResponse;
import com.cgdn.cinema.modules.user.entity.User;

public final class StaffMapper {

    private StaffMapper() {
    }

    public static StaffResponse toResponse(User user) {
        return new StaffResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getGender(),
                user.getDateOfBirth(),
                user.getCitizenId(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getAddress(),
                user.getAvatarUrl(),
                user.getCinemaId(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }
}

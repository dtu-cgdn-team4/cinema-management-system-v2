package com.cgdn.cinema.modules.auth.mapper;

import com.cgdn.cinema.modules.auth.dto.response.LoginResponse;
import com.cgdn.cinema.modules.user.entity.User;
import org.springframework.stereotype.Component;

/**
 * Ánh xạ thực thể User sang DTO phản hồi của module xác thực.
 */
@Component
public class AuthMapper {

    public LoginResponse toLoginResponse(String accessToken, long expiresInMs, User user) {
        return new LoginResponse(accessToken, "Bearer", expiresInMs, toUserInfoResponse(user));
    }
    public LoginResponse.UserInfoResponse toUserInfoResponse(User user) {
        return new LoginResponse.UserInfoResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                user.getRole().getSecurityRole(),
                user.getCinemaId(),
                user.getLoyaltyPoints()
        );
    }
}

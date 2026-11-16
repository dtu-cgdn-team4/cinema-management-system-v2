package com.cgdn.cinema.modules.auth.dto.response;

import com.cgdn.cinema.common.enums.Role;

/**
 * Kết quả trả về sau khi đăng nhập thành công gồm JWT token và thông tin người dùng.
 */
public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresInMs,
        UserInfoResponse user
) {
    public record UserInfoResponse(
            Long id,
            String username,
            String fullName,
            String email,
            String phoneNumber,
            String avatarUrl,
            Role role,
            String roleCode,
            Long cinemaId,
            Integer loyaltyPoints
    ) {
        public UserInfoResponse(
                Long id,
                String username,
                String fullName,
                String email,
                String phoneNumber,
                Role role,
                String roleCode,
                Long cinemaId,
                Integer loyaltyPoints
        ) {
            this(id, username, fullName, email, phoneNumber, null, role, roleCode, cinemaId, loyaltyPoints);
        }
    }
}

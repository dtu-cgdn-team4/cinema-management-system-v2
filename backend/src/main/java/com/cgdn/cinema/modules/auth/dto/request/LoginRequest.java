package com.cgdn.cinema.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Dữ liệu đầu vào khi người dùng gửi yêu cầu đăng nhập.
 */
public record LoginRequest(
        @NotBlank(message = "Tài khoản hoặc email không được để trống")
        String username,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password
) {
}


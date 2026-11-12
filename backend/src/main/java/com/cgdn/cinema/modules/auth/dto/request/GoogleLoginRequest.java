package com.cgdn.cinema.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Dữ liệu đầu vào khi người dùng đăng nhập bằng Google ID Token từ frontend.
 */
public record GoogleLoginRequest(
        @NotBlank(message = "Google ID token không được để trống")
        String idToken
) {
}


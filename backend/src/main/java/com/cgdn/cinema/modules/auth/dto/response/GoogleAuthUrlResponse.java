package com.cgdn.cinema.modules.auth.dto.response;

/**
 * Phản hồi chứa đường dẫn xác thực Google OAuth2 để chuyển hướng người dùng.
 */
public record GoogleAuthUrlResponse(String authorizationUrl) {
}


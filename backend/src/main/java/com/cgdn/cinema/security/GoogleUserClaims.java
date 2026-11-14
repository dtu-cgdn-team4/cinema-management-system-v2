package com.cgdn.cinema.security;

/**
 * Thông tin người dùng đã được xác thực từ Google ID Token.
 */
public record GoogleUserClaims(
        String googleId,
        String email,
        String fullName,
        String picture
) {
    public GoogleUserClaims(String googleId, String email, String fullName) {
        this(googleId, email, fullName, null);
    }
}

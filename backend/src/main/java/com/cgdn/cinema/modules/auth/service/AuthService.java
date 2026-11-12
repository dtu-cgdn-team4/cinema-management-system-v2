package com.cgdn.cinema.modules.auth.service;

import com.cgdn.cinema.modules.auth.dto.request.GoogleLoginRequest;
import com.cgdn.cinema.modules.auth.dto.request.LoginRequest;
import com.cgdn.cinema.modules.auth.dto.response.GoogleAuthUrlResponse;
import com.cgdn.cinema.modules.auth.dto.response.LoginResponse;

/**
 * Hợp đồng nghiệp vụ xác thực người dùng.
 */
public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse loginWithGoogle(GoogleLoginRequest request);

    LoginResponse loginWithGoogleCode(String code);

    GoogleAuthUrlResponse getGoogleAuthorizationUrl(String state);

    LoginResponse.UserInfoResponse getCurrentUser(String username);
}

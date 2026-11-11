package com.cgdn.cinema.modules.auth.service;

import com.cgdn.cinema.modules.auth.dto.request.LoginRequest;
import com.cgdn.cinema.modules.auth.dto.response.LoginResponse;

/**
 * Hợp đồng nghiệp vụ xác thực người dùng.
 */
public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse.UserInfoResponse getCurrentUser(String username);
}


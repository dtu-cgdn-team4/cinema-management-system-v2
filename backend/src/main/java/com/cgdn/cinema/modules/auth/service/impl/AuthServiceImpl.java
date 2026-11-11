package com.cgdn.cinema.modules.auth.service.impl;

import com.cgdn.cinema.common.enums.RecordStatus;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.auth.dto.request.LoginRequest;
import com.cgdn.cinema.modules.auth.dto.response.LoginResponse;
import com.cgdn.cinema.modules.auth.mapper.AuthMapper;
import com.cgdn.cinema.modules.auth.service.AuthService;
import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import com.cgdn.cinema.security.JwtProperties;
import com.cgdn.cinema.security.JwtTokenProvider;
import com.cgdn.cinema.security.SecurityProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Triển khai nghiệp vụ đăng nhập: xác thực BCrypt, khóa tạm khi sai 5 lần và cấp JWT.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final SecurityProperties securityProperties;
    private final AuthMapper authMapper;
    private final Clock appClock;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider,
                           JwtProperties jwtProperties,
                           SecurityProperties securityProperties,
                           AuthMapper authMapper,
                           Clock appClock) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtProperties = jwtProperties;
        this.securityProperties = securityProperties;
        this.authMapper = authMapper;
        this.appClock = appClock;
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public LoginResponse login(LoginRequest request) {
        String identifier = request.username().trim();
        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        ensureAccountActive(user);
        boolean unlockedFromExpiry = ensureAccountUnlockedOrAutoUnlock(user);

        if (user.getPassword() == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            handleFailedLoginAttempt(user);
        }

        if (unlockedFromExpiry || (user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0)) {
            user.setFailedLoginAttempts(0);
            user.setLocked(false);
            userRepository.save(user);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        return authMapper.toLoginResponse(accessToken, jwtProperties.getExpirationMs(), user);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse.UserInfoResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        ensureAccountActive(user);
        if (Boolean.TRUE.equals(user.getLocked())) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }
        return authMapper.toUserInfoResponse(user);
    }

    private void ensureAccountActive(User user) {
        if (!Integer.valueOf(RecordStatus.ACTIVE.getCode()).equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED);
        }
    }

    private boolean ensureAccountUnlockedOrAutoUnlock(User user) {
        if (!Boolean.TRUE.equals(user.getLocked())) {
            return false;
        }

        int failedAttempts = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();
        int maxAttempts = securityProperties.getMaxFailedAttempts();
        if (failedAttempts < maxAttempts || user.getUpdatedAt() == null) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED,
                    "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên");
        }

        LocalDateTime now = LocalDateTime.now(appClock);
        LocalDateTime unlockAt = user.getUpdatedAt().plusMinutes(securityProperties.getLockDurationMinutes());
        if (now.isBefore(unlockAt)) {
            long secondsLeft = Math.max(1L, Duration.between(now, unlockAt).getSeconds());
            long minutesLeft = (secondsLeft + 59) / 60;
            throw new BusinessException(
                    ErrorCode.ACCOUNT_LOCKED,
                    "Tài khoản đang bị khóa tạm thời do đăng nhập sai " + maxAttempts
                            + " lần. Vui lòng thử lại sau " + minutesLeft + " phút"
            );
        }

        // Hết thời gian khóa tạm: mở khóa lại trước khi kiểm tra mật khẩu
        user.setLocked(false);
        user.setFailedLoginAttempts(0);
        return true;
    }

    private void handleFailedLoginAttempt(User user) {
        int currentAttempts = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();
        int nextAttempts = currentAttempts + 1;
        int maxAttempts = securityProperties.getMaxFailedAttempts();

        user.setFailedLoginAttempts(nextAttempts);
        if (nextAttempts >= maxAttempts) {
            user.setLocked(true);
            userRepository.save(user);
            throw new BusinessException(
                    ErrorCode.ACCOUNT_LOCKED,
                    "Tài khoản đã bị khóa tạm thời " + securityProperties.getLockDurationMinutes()
                            + " phút do đăng nhập sai " + maxAttempts + " lần"
            );
        }
        userRepository.save(user);
        throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
    }
}

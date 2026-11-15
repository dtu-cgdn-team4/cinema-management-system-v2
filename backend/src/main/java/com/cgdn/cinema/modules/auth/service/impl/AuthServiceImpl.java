package com.cgdn.cinema.modules.auth.service.impl;

import com.cgdn.cinema.common.enums.RecordStatus;
import com.cgdn.cinema.common.enums.Role;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.auth.dto.request.GoogleLoginRequest;
import com.cgdn.cinema.modules.auth.dto.request.LoginRequest;
import com.cgdn.cinema.modules.auth.dto.response.GoogleAuthUrlResponse;
import com.cgdn.cinema.modules.auth.dto.response.LoginResponse;
import com.cgdn.cinema.modules.auth.mapper.AuthMapper;
import com.cgdn.cinema.modules.auth.service.AuthService;
import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import com.cgdn.cinema.security.GoogleTokenVerifier;
import com.cgdn.cinema.security.GoogleUserClaims;
import com.cgdn.cinema.security.JwtProperties;
import com.cgdn.cinema.security.JwtTokenProvider;
import com.cgdn.cinema.security.SecurityProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/**
 * Triển khai nghiệp vụ đăng nhập thường (BCrypt, khóa tạm khi sai 5 lần) và đăng nhập Google.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final int MAX_USERNAME_BASE_LENGTH = 80;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final SecurityProperties securityProperties;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final AuthMapper authMapper;
    private final Clock appClock;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider,
                           JwtProperties jwtProperties,
                           SecurityProperties securityProperties,
                           GoogleTokenVerifier googleTokenVerifier,
                           AuthMapper authMapper,
                           Clock appClock) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtProperties = jwtProperties;
        this.securityProperties = securityProperties;
        this.googleTokenVerifier = googleTokenVerifier;
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

        if (user.getPassword() == null) {
            if (unlockedFromExpiry) {
                userRepository.save(user);
            }
            throw new BusinessException(ErrorCode.GOOGLE_PASSWORD_NOT_SET);
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            handleFailedLoginAttempt(user);
        }

        return issueLoginResponse(user, unlockedFromExpiry);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleUserClaims claims = googleTokenVerifier.verifyIdToken(request.idToken());
        return authenticateGoogleClaims(claims);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public LoginResponse loginWithGoogleCode(String code) {
        GoogleUserClaims claims = googleTokenVerifier.exchangeAuthorizationCode(code);
        return authenticateGoogleClaims(claims);
    }

    @Override
    public GoogleAuthUrlResponse getGoogleAuthorizationUrl(String state) {
        return new GoogleAuthUrlResponse(googleTokenVerifier.buildAuthorizationUrl(state));
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

    private LoginResponse authenticateGoogleClaims(GoogleUserClaims claims) {
        String normalizedEmail = claims.email().trim().toLowerCase(Locale.ROOT);

        Optional<User> existingByGoogleId = userRepository.findByGoogleId(claims.googleId());
        if (existingByGoogleId.isPresent()) {
            User user = existingByGoogleId.get();
            if (StringUtils.hasText(claims.picture())) {
                user.setAvatarUrl(claims.picture());
            }
            ensureAccountActive(user);
            boolean unlocked = ensureAccountUnlockedOrAutoUnlock(user);
            return issueLoginResponse(user, unlocked);
        }

        Optional<User> existingByEmail = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            ensureAccountActive(user);
            boolean unlocked = ensureAccountUnlockedOrAutoUnlock(user);

            if (user.getGoogleId() == null) {
                user.setGoogleId(claims.googleId());
                unlocked = true;
            } else if (!user.getGoogleId().equals(claims.googleId())) {
                throw new BusinessException(ErrorCode.GOOGLE_ACCOUNT_MISMATCH);
            }
            if (StringUtils.hasText(claims.picture()) && user.getAvatarUrl() == null) {
                user.setAvatarUrl(claims.picture());
            }
            return issueLoginResponse(user, unlocked);
        }

        User newUser = registerGoogleCustomer(claims.googleId(), normalizedEmail, claims.fullName(), claims.picture());
        return issueLoginResponse(newUser, false);
    }

    private User registerGoogleCustomer(String googleId, String email, String fullName, String avatarUrl) {
        User user = new User();
        user.setUsername(generateUniqueUsername(email));
        user.setEmail(email);
        user.setFullName(resolveFullName(fullName, email));
        user.setAvatarUrl(avatarUrl);
        user.setGoogleId(googleId);
        user.setRole(Role.KHACH_HANG);
        user.setStatus(RecordStatus.ACTIVE.getCode());
        user.setLocked(false);
        user.setFailedLoginAttempts(0);
        user.setLoyaltyPoints(0);
        return userRepository.save(user);
    }

    private String resolveFullName(String fullName, String email) {
        if (StringUtils.hasText(fullName)) {
            String trimmed = fullName.trim();
            return trimmed.length() > 255 ? trimmed.substring(0, 255) : trimmed;
        }
        int atIndex = email.indexOf('@');
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }

    private String generateUniqueUsername(String email) {
        int atIndex = email.indexOf('@');
        String rawPrefix = atIndex > 0 ? email.substring(0, atIndex) : email;
        String cleaned = rawPrefix.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (!StringUtils.hasText(cleaned)) {
            cleaned = "google_user";
        }
        String base = cleaned.length() > MAX_USERNAME_BASE_LENGTH
                ? cleaned.substring(0, MAX_USERNAME_BASE_LENGTH)
                : cleaned;

        if (!userRepository.existsByUsername(base)) {
            return base;
        }

        for (int attempt = 1; attempt <= 99; attempt++) {
            String candidate = base + "_" + attempt;
            if (!userRepository.existsByUsername(candidate)) {
                return candidate;
            }
        }

        return base + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    private LoginResponse issueLoginResponse(User user, boolean forceSave) {
        if (forceSave || (user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0)) {
            user.setFailedLoginAttempts(0);
            user.setLocked(false);
            userRepository.save(user);
        }
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        return authMapper.toLoginResponse(accessToken, jwtProperties.getExpirationMs(), user);
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

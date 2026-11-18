package com.cgdn.cinema.modules.auth.service;

import com.cgdn.cinema.common.enums.RecordStatus;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.auth.dto.response.LoginResponse;
import com.cgdn.cinema.modules.auth.entity.AuthRefreshToken;
import com.cgdn.cinema.modules.auth.mapper.AuthMapper;
import com.cgdn.cinema.modules.auth.repository.AuthRefreshTokenRepository;
import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import com.cgdn.cinema.security.JwtProperties;
import com.cgdn.cinema.security.JwtTokenProvider;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/** Creates, rotates, and revokes refresh tokens without storing their raw values. */
@Service
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;

    private final AuthRefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final AuthMapper authMapper;
    private final Clock clock;

    public RefreshTokenService(AuthRefreshTokenRepository refreshTokenRepository,
                               UserRepository userRepository,
                               JwtTokenProvider jwtTokenProvider,
                               JwtProperties jwtProperties,
                               AuthMapper authMapper,
                               Clock clock) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtProperties = jwtProperties;
        this.authMapper = authMapper;
        this.clock = clock;
    }

    @Transactional
    public IssuedSession issue(Long userId, boolean persistent, LoginResponse loginResponse) {
        LocalDateTime now = LocalDateTime.now(clock);
        refreshTokenRepository.deleteByExpiresAtBefore(now);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return createSession(user, persistent, now, loginResponse);
    }

    @Transactional(noRollbackFor = BusinessException.class)
    public IssuedSession rotate(String rawToken) {
        if (!StringUtils.hasText(rawToken)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        LocalDateTime now = LocalDateTime.now(clock);
        refreshTokenRepository.deleteByExpiresAtBefore(now);
        AuthRefreshToken current = refreshTokenRepository.findByTokenHashForUpdate(hash(rawToken))
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        if (current.getRevokedAt() != null || !current.getExpiresAt().isAfter(now)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        User user = current.getUser();
        if (!Integer.valueOf(RecordStatus.ACTIVE.getCode()).equals(user.getStatus())) {
            current.setRevokedAt(now);
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED);
        }
        if (Boolean.TRUE.equals(user.getLocked())) {
            current.setRevokedAt(now);
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        current.setRevokedAt(now);
        return createSession(user, current.isPersistent(), now, null);
    }

    @Transactional
    public void revoke(String rawToken) {
        if (!StringUtils.hasText(rawToken)) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(clock);
        refreshTokenRepository.findByTokenHashForUpdate(hash(rawToken))
                .filter(token -> token.getRevokedAt() == null)
                .ifPresent(token -> token.setRevokedAt(now));
    }

    private IssuedSession createSession(
            User user, boolean persistent, LocalDateTime now, LoginResponse existingLoginResponse) {
        String rawToken = generateToken();
        AuthRefreshToken token = new AuthRefreshToken();
        token.setUser(user);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(now.plus(Duration.ofMillis(jwtProperties.getRefreshExpirationMs())));
        token.setPersistent(persistent);
        token.setCreatedAt(now);
        refreshTokenRepository.save(token);

        LoginResponse response = existingLoginResponse;
        if (response == null) {
            String accessToken = jwtTokenProvider.generateAccessToken(user);
            response = authMapper.toLoginResponse(accessToken, jwtProperties.getExpirationMs(), user);
        }
        return new IssuedSession(response, rawToken, persistent);
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    public record IssuedSession(LoginResponse loginResponse, String refreshToken, boolean persistent) {
    }
}

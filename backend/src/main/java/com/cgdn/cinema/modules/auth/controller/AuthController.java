package com.cgdn.cinema.modules.auth.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.auth.dto.request.GoogleLoginRequest;
import com.cgdn.cinema.modules.auth.dto.request.LoginRequest;
import com.cgdn.cinema.modules.auth.dto.request.RegisterRequest;
import com.cgdn.cinema.modules.auth.dto.response.GoogleAuthUrlResponse;
import com.cgdn.cinema.modules.auth.dto.response.LoginResponse;
import com.cgdn.cinema.modules.auth.dto.response.RegisterResponse;
import com.cgdn.cinema.modules.auth.service.AuthService;
import com.cgdn.cinema.modules.auth.service.RegistrationService;
import com.cgdn.cinema.security.CustomUserDetails;
import com.cgdn.cinema.security.GoogleProperties;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

/**
 * REST controller xử lý xác thực người dùng.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String GOOGLE_STATE_COOKIE = "GOOGLE_OAUTH_STATE";
    private static final String GOOGLE_CALLBACK_PATH = "/api/v1/auth/google/callback";
    private static final Duration GOOGLE_STATE_TTL = Duration.ofMinutes(5);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AuthService authService;
    private final GoogleProperties googleProperties;
    private final RegistrationService registration;

    public AuthController(AuthService authService, GoogleProperties googleProperties,
                          RegistrationService registration) {
        this.authService = authService;
        this.googleProperties = googleProperties;
        this.registration = registration;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                HttpStatus.CREATED.value(), "Đăng ký thành công.", registration.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponse>> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request) {
        LoginResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập Google thành công", response));
    }

    @GetMapping("/google/url")
    public ResponseEntity<ApiResponse<GoogleAuthUrlResponse>> getGoogleAuthUrl() {
        String state = createState();
        ResponseCookie stateCookie = createStateCookie(state, GOOGLE_STATE_TTL);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, stateCookie.toString())
                .body(ApiResponse.success(authService.getGoogleAuthorizationUrl(state)));
    }

    @GetMapping("/google/callback")
    public ResponseEntity<ApiResponse<LoginResponse>> loginWithGoogleCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state,
            @CookieValue(value = GOOGLE_STATE_COOKIE, required = false) String expectedState,
            HttpServletResponse servletResponse) {
        servletResponse.addHeader(HttpHeaders.SET_COOKIE, createStateCookie("", Duration.ZERO).toString());
        if (!matchesState(expectedState, state)) {
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_STATE);
        }

        LoginResponse response = authService.loginWithGoogleCode(code);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập Google thành công", response));
    }

    private String createState() {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private boolean matchesState(String expectedState, String actualState) {
        if (!StringUtils.hasText(expectedState) || !StringUtils.hasText(actualState)) {
            return false;
        }

        return MessageDigest.isEqual(
                expectedState.getBytes(StandardCharsets.UTF_8),
                actualState.getBytes(StandardCharsets.UTF_8));
    }

    private ResponseCookie createStateCookie(String value, Duration maxAge) {
        String redirectScheme = URI.create(googleProperties.getRedirectUri()).getScheme();
        boolean secure = "https".equalsIgnoreCase(redirectScheme);

        return ResponseCookie.from(GOOGLE_STATE_COOKIE, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path(GOOGLE_CALLBACK_PATH)
                .maxAge(maxAge)
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse.UserInfoResponse>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser(userDetails.getUsername())));
    }
}

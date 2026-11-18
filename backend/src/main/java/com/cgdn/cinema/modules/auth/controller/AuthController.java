package com.cgdn.cinema.modules.auth.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.auth.dto.request.CompleteProfileRequest;
import com.cgdn.cinema.modules.auth.dto.request.GoogleLoginRequest;
import com.cgdn.cinema.modules.auth.dto.request.LoginRequest;
import com.cgdn.cinema.modules.auth.dto.request.RegisterAvailabilityRequest;
import com.cgdn.cinema.modules.auth.dto.request.RegisterRequest;
import com.cgdn.cinema.modules.auth.dto.response.GoogleAuthUrlResponse;
import com.cgdn.cinema.modules.auth.dto.response.LoginResponse;
import com.cgdn.cinema.modules.auth.dto.response.RegisterAvailabilityResponse;
import com.cgdn.cinema.modules.auth.dto.response.RegisterResponse;
import com.cgdn.cinema.modules.auth.service.AuthService;
import com.cgdn.cinema.modules.auth.service.RefreshTokenService;
import com.cgdn.cinema.modules.auth.service.RegistrationService;
import com.cgdn.cinema.security.CustomUserDetails;
import com.cgdn.cinema.security.GoogleProperties;
import com.cgdn.cinema.security.JwtProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
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
    private static final String GOOGLE_REMEMBER_ME_COOKIE = "GOOGLE_REMEMBER_ME";
    private static final String REFRESH_TOKEN_COOKIE = "CINEMA_REFRESH_TOKEN";
    private static final String AUTH_COOKIE_PATH = "/api/v1/auth";
    private static final String GOOGLE_CALLBACK_PATH = "/api/v1/auth/google/callback";
    private static final Duration GOOGLE_STATE_TTL = Duration.ofMinutes(5);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final GoogleProperties googleProperties;
    private final RegistrationService registration;
    private final RefreshTokenService refreshTokenService;
    private final JwtProperties jwtProperties;

    @Autowired
    public AuthController(AuthService authService, GoogleProperties googleProperties,
            RegistrationService registration, RefreshTokenService refreshTokenService,
            JwtProperties jwtProperties) {
        this.authService = authService;
        this.googleProperties = googleProperties;
        this.registration = registration;
        this.refreshTokenService = refreshTokenService;
        this.jwtProperties = jwtProperties;
    }

    public AuthController(AuthService authService, GoogleProperties googleProperties,
            RegistrationService registration, ObjectMapper objectMapper) {
        this(authService, googleProperties, registration, null, null);
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                HttpStatus.CREATED.value(), "Đăng ký thành công.", registration.register(request)));
    }

    @PostMapping("/register/availability")
    public ResponseEntity<ApiResponse<RegisterAvailabilityResponse>> checkRegisterAvailability(
            @Valid @RequestBody RegisterAvailabilityRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Đã kiểm tra thông tin đăng ký.", registration.checkAvailability(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request,
                                                            HttpServletRequest servletRequest) {
        LoginResponse loginResponse = authService.login(request);
        RefreshTokenService.IssuedSession session = refreshTokenService.issue(
                loginResponse.user().id(), !Boolean.FALSE.equals(request.rememberMe()), loginResponse);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createRefreshCookie(session, servletRequest).toString())
                .body(ApiResponse.success("Đăng nhập thành công", session.loginResponse()));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponse>> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request,
            HttpServletRequest servletRequest) {
        LoginResponse loginResponse = authService.loginWithGoogle(request);
        RefreshTokenService.IssuedSession session = refreshTokenService.issue(
                loginResponse.user().id(), !Boolean.FALSE.equals(request.rememberMe()), loginResponse);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createRefreshCookie(session, servletRequest).toString())
                .body(ApiResponse.success("Đăng nhập Google thành công", session.loginResponse()));
    }

    @GetMapping("/google/url")
    public ResponseEntity<ApiResponse<GoogleAuthUrlResponse>> getGoogleAuthUrl(
            @RequestParam(value = "rememberMe", defaultValue = "true") boolean rememberMe) {
        String state = createState();
        ResponseCookie stateCookie = createStateCookie(state, GOOGLE_STATE_TTL);
        ResponseCookie rememberMeCookie = createGoogleRememberMeCookie(rememberMe, GOOGLE_STATE_TTL);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, stateCookie.toString())
                .header(HttpHeaders.SET_COOKIE, rememberMeCookie.toString())
                .body(ApiResponse.success(authService.getGoogleAuthorizationUrl(state)));
    }

    @GetMapping("/google/callback")
    public Object loginWithGoogleCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state,
            @CookieValue(value = GOOGLE_STATE_COOKIE, required = false) String expectedState,
            @CookieValue(value = GOOGLE_REMEMBER_ME_COOKIE, required = false) String rememberMeCookie,
            @RequestHeader(value = HttpHeaders.ACCEPT, required = false) String acceptHeader,
            @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) throws IOException {
        servletResponse.addHeader(HttpHeaders.SET_COOKIE, createStateCookie("", Duration.ZERO).toString());
        servletResponse.addHeader(HttpHeaders.SET_COOKIE,
                createGoogleRememberMeCookie(false, Duration.ZERO).toString());

        boolean isBrowser = (acceptHeader != null && acceptHeader.contains(MediaType.TEXT_HTML_VALUE))
                || (userAgent != null && (userAgent.contains("Mozilla") || userAgent.contains("Chrome")
                        || userAgent.contains("Safari")));

        if (!matchesState(expectedState, state)) {
            if (isBrowser) {
                String errorRedirect = UriComponentsBuilder.fromUriString("http://localhost:5173/auth/google/callback")
                        .queryParam("error",
                                URLEncoder.encode("Trạng thái xác thực không hợp lệ hoặc đã hết hạn.",
                                        StandardCharsets.UTF_8))
                        .build(true)
                        .toUriString();
                servletResponse.sendRedirect(errorRedirect);
                return null;
            }
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_STATE);
        }

        try {
            LoginResponse loginResponse = authService.loginWithGoogleCode(code);
            boolean persistent = !"false".equalsIgnoreCase(rememberMeCookie);
            RefreshTokenService.IssuedSession session = refreshTokenService.issue(
                    loginResponse.user().id(), persistent, loginResponse);
            servletResponse.addHeader(HttpHeaders.SET_COOKIE,
                    createRefreshCookie(session, servletRequest).toString());
            LoginResponse response = session.loginResponse();

            if (isBrowser) {
                String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/auth/google/callback")
                        .build()
                        .toUriString();
                servletResponse.sendRedirect(redirectUrl);
                return null;
            }

            return ResponseEntity.ok(ApiResponse.success("Đăng nhập Google thành công", response));
        } catch (Exception ex) {
            if (isBrowser) {
                String errorMsg;
                if (ex instanceof BusinessException) {
                    errorMsg = ex.getMessage();
                } else {
                    log.error("Google OAuth callback failed", ex);
                    errorMsg = "Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.";
                }
                String errorRedirect = UriComponentsBuilder.fromUriString("http://localhost:5173/auth/google/callback")
                        .queryParam("error", URLEncoder.encode(errorMsg, StandardCharsets.UTF_8))
                        .build(true)
                        .toUriString();
                servletResponse.sendRedirect(errorRedirect);
                return null;
            }
            throw ex;
        }
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

    private ResponseCookie createGoogleRememberMeCookie(boolean rememberMe, Duration maxAge) {
        String redirectScheme = URI.create(googleProperties.getRedirectUri()).getScheme();
        boolean secure = "https".equalsIgnoreCase(redirectScheme);

        return ResponseCookie.from(GOOGLE_REMEMBER_ME_COOKIE, Boolean.toString(rememberMe))
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path(GOOGLE_CALLBACK_PATH)
                .maxAge(maxAge)
                .build();
    }

    private ResponseCookie createRefreshCookie(
            RefreshTokenService.IssuedSession session, HttpServletRequest request) {
        boolean secure = jwtProperties.isRefreshCookieSecure() || request.isSecure();
        ResponseCookie.ResponseCookieBuilder cookie = ResponseCookie
                .from(REFRESH_TOKEN_COOKIE, session.refreshToken())
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path(AUTH_COOKIE_PATH);
        if (session.persistent()) {
            cookie.maxAge(Duration.ofMillis(jwtProperties.getRefreshExpirationMs()));
        }
        return cookie.build();
    }

    private ResponseCookie clearRefreshCookie(boolean secure) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path(AUTH_COOKIE_PATH)
                .maxAge(Duration.ZERO)
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @CookieValue(value = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
            HttpServletRequest servletRequest) {
        RefreshTokenService.IssuedSession session = refreshTokenService.rotate(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createRefreshCookie(session, servletRequest).toString())
                .body(ApiResponse.success("Phiên đăng nhập đã được làm mới", session.loginResponse()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(value = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
            HttpServletRequest servletRequest) {
        refreshTokenService.revoke(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie(
                        jwtProperties.isRefreshCookieSecure() || servletRequest.isSecure()).toString())
                .body(ApiResponse.success("Đăng xuất thành công", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse.UserInfoResponse>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser(userDetails.getUsername())));
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<ApiResponse<LoginResponse.UserInfoResponse>> completeProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CompleteProfileRequest request) {
        if (userDetails == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        LoginResponse.UserInfoResponse updatedUser = authService.completeProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Hoàn tất thông tin tài khoản thành công", updatedUser));
    }
}

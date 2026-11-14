package com.cgdn.cinema.security;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Set;

/**
 * Xác thực Google ID Token bằng Google JWKs và hỗ trợ đổi OAuth2 authorization code.
 */
@Component
public class GoogleJwtTokenVerifier implements GoogleTokenVerifier {

    private static final Set<String> VALID_ISSUERS = Set.of(
            "https://accounts.google.com",
            "accounts.google.com"
    );

    private final GoogleProperties googleProperties;
    private volatile RestClient restClient;
    private volatile JwtDecoder jwtDecoder;

    public GoogleJwtTokenVerifier(GoogleProperties googleProperties) {
        this.googleProperties = googleProperties;
    }

    @Override
    public GoogleUserClaims verifyIdToken(String idToken) {
        ensureClientIdConfigured();
        if (!StringUtils.hasText(idToken)) {
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }

        Jwt jwt;
        try {
            jwt = getOrCreateJwtDecoder().decode(idToken.trim());
        } catch (JwtException ex) {
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }

        String googleId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        Object emailVerifiedClaim = jwt.getClaim("email_verified");
        String name = jwt.getClaimAsString("name");
        String picture = jwt.getClaimAsString("picture");

        if (!StringUtils.hasText(googleId) || !StringUtils.hasText(email)) {
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }

        boolean emailVerified = Boolean.TRUE.equals(emailVerifiedClaim)
                || "true".equalsIgnoreCase(String.valueOf(emailVerifiedClaim));
        if (!emailVerified) {
            throw new BusinessException(ErrorCode.GOOGLE_EMAIL_UNVERIFIED);
        }

        return new GoogleUserClaims(googleId, email, name, picture);
    }

    @Override
    public GoogleUserClaims exchangeAuthorizationCode(String code) {
        ensureClientIdConfigured();
        if (!StringUtils.hasText(googleProperties.getClientSecret())) {
            throw new BusinessException(
                    ErrorCode.GOOGLE_AUTH_NOT_CONFIGURED,
                    "Đăng nhập Google theo authorization code thiếu GOOGLE_CLIENT_SECRET"
            );
        }
        if (!StringUtils.hasText(code)) {
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN, "Mã xác thực Google không được để trống");
        }

        MultiValueMap<String, String> formBody = new LinkedMultiValueMap<>();
        formBody.add("code", code.trim());
        formBody.add("client_id", googleProperties.getClientId());
        formBody.add("client_secret", googleProperties.getClientSecret());
        formBody.add("redirect_uri", googleProperties.getRedirectUri());
        formBody.add("grant_type", "authorization_code");

        GoogleTokenResponse tokenResponse;
        try {
            tokenResponse = getOrCreateRestClient().post()
                    .uri(googleProperties.getTokenUri())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formBody)
                    .retrieve()
                    .body(GoogleTokenResponse.class);
        } catch (RestClientException ex) {
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }

        if (tokenResponse == null || !StringUtils.hasText(tokenResponse.idToken())) {
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
        return verifyIdToken(tokenResponse.idToken());
    }

    @Override
    public String buildAuthorizationUrl(String state) {
        ensureClientIdConfigured();
        if (!StringUtils.hasText(state)) {
            throw new BusinessException(ErrorCode.INVALID_GOOGLE_STATE);
        }
        return UriComponentsBuilder
                .fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", googleProperties.getClientId())
                .queryParam("redirect_uri", googleProperties.getRedirectUri())
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .queryParam("access_type", "offline")
                .queryParam("prompt", "select_account")
                .queryParam("state", state)
                .build()
                .encode()
                .toUriString();
    }

    private void ensureClientIdConfigured() {
        if (!StringUtils.hasText(googleProperties.getClientId())) {
            throw new BusinessException(ErrorCode.GOOGLE_AUTH_NOT_CONFIGURED);
        }
    }

    private RestClient getOrCreateRestClient() {
        RestClient current = restClient;
        if (current != null) {
            return current;
        }
        synchronized (this) {
            if (restClient == null) {
                restClient = RestClient.builder()
                        .requestFactory(new SimpleClientHttpRequestFactory())
                        .build();
            }
            return restClient;
        }
    }

    private JwtDecoder getOrCreateJwtDecoder() {
        JwtDecoder current = jwtDecoder;
        if (current != null) {
            return current;
        }
        synchronized (this) {
            if (jwtDecoder == null) {
                NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(googleProperties.getJwkSetUri()).build();
                decoder.setJwtValidator(buildValidator());
                jwtDecoder = decoder;
            }
            return jwtDecoder;
        }
    }

    private OAuth2TokenValidator<Jwt> buildValidator() {
        OAuth2TokenValidator<Jwt> issuerValidator = jwt -> {
            String issuer = jwt.getIssuer() != null ? jwt.getIssuer().toString() : null;
            if (issuer != null && VALID_ISSUERS.contains(issuer)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_issuer", "Google issuer không hợp lệ", null));
        };

        OAuth2TokenValidator<Jwt> audienceValidator = jwt -> {
            List<String> audiences = jwt.getAudience();
            if (audiences != null && audiences.contains(googleProperties.getClientId())) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_audience", "Google client_id không khớp", null));
        };

        return new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefault(),
                issuerValidator,
                audienceValidator
        );
    }

    private record GoogleTokenResponse(@JsonProperty("id_token") String idToken) {
    }
}


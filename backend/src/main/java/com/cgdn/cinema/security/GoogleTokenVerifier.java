package com.cgdn.cinema.security;

/**
 * Hợp đồng xác thực token và trao đổi mã OAuth2 với Google.
 */
public interface GoogleTokenVerifier {

    GoogleUserClaims verifyIdToken(String idToken);

    GoogleUserClaims exchangeAuthorizationCode(String code);

    String buildAuthorizationUrl(String state);
}


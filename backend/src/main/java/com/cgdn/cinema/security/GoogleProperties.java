package com.cgdn.cinema.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Thuộc tính cấu hình Google OAuth2 lấy từ tiền tố app.google trong application.properties.
 */
@ConfigurationProperties(prefix = "app.google")
public class GoogleProperties {

    private String clientId;
    private String clientSecret;
    private String redirectUri = "http://localhost:8080/api/v1/auth/google/callback";
    private String jwkSetUri = "https://www.googleapis.com/oauth2/v3/certs";
    private String tokenUri = "https://oauth2.googleapis.com/token";

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    public String getJwkSetUri() {
        return jwkSetUri;
    }

    public void setJwkSetUri(String jwkSetUri) {
        this.jwkSetUri = jwkSetUri;
    }

    public String getTokenUri() {
        return tokenUri;
    }

    public void setTokenUri(String tokenUri) {
        this.tokenUri = tokenUri;
    }
}


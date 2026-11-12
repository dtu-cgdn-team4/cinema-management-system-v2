package com.cgdn.cinema.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Chính sách bảo mật tài khoản lấy từ tiền tố app.security trong application.properties.
 */
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    private int maxFailedAttempts = 5;
    private long lockDurationMinutes = 15L;

    public int getMaxFailedAttempts() {
        return maxFailedAttempts;
    }

    public void setMaxFailedAttempts(int maxFailedAttempts) {
        this.maxFailedAttempts = maxFailedAttempts;
    }

    public long getLockDurationMinutes() {
        return lockDurationMinutes;
    }

    public void setLockDurationMinutes(long lockDurationMinutes) {
        this.lockDurationMinutes = lockDurationMinutes;
    }
}

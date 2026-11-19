CREATE TABLE auth_refresh_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    remember_me BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auth_refresh_token_user
        FOREIGN KEY (user_id) REFERENCES nguoi_dung (id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_refresh_token_user_id ON auth_refresh_token (user_id);
CREATE INDEX idx_auth_refresh_token_expires_at ON auth_refresh_token (expires_at);

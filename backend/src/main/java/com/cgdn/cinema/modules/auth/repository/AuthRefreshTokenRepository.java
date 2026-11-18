package com.cgdn.cinema.modules.auth.repository;

import com.cgdn.cinema.modules.auth.entity.AuthRefreshToken;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuthRefreshTokenRepository extends JpaRepository<AuthRefreshToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from AuthRefreshToken token join fetch token.user where token.tokenHash = :hash")
    Optional<AuthRefreshToken> findByTokenHashForUpdate(@Param("hash") String hash);

    void deleteByExpiresAtBefore(LocalDateTime now);
}

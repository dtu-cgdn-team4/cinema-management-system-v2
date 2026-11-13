package com.cgdn.cinema.modules.user.repository;

import com.cgdn.cinema.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA repository thao tác với bảng nguoi_dung.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByGoogleId(String googleId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);
}

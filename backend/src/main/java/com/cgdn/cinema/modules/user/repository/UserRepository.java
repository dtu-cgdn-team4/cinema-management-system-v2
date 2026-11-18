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

    /** Kiểm tra email đã thuộc tài khoản khác; loại ID hiện tại để gửi lại email cũ vẫn hợp lệ. */
    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByPhoneNumber(String phoneNumber);

    /** Kiểm tra số điện thoại đã thuộc tài khoản khác; không coi giá trị của chính mình là trùng. */
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long id);
}

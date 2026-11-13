package com.cgdn.cinema.modules.auth.service;

import com.cgdn.cinema.common.enums.Role;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.infrastructure.sms.FirebasePhoneVerifier;
import com.cgdn.cinema.modules.auth.dto.request.RegisterRequest;
import com.cgdn.cinema.modules.auth.dto.response.RegisterResponse;
import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Period;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/** Xác minh OTP, kiểm tra dữ liệu đăng ký rồi lưu tài khoản khách hàng. */
@Service
public class RegistrationService {
    private final UserRepository users;
    private final FirebasePhoneVerifier phoneVerifier;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public RegistrationService(UserRepository users, FirebasePhoneVerifier phoneVerifier) {
        this.users = users;
        this.phoneVerifier = phoneVerifier;
    }

    public RegisterResponse register(RegisterRequest request) {
        // Xác minh số điện thoại trước khi kiểm tra tài khoản để token không hợp lệ không đi tiếp vào luồng đăng ký.
        phoneVerifier.verify(request.firebaseIdToken(), request.phoneNumber());
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String fullName = request.fullName().trim();
        String address = request.address() == null ? null : request.address().trim();
        LocalDate birthDate = request.dateOfBirth();

        validateProfile(fullName, address, birthDate, request.password());
        ensureNotRegistered(username, email, request.phoneNumber());

        String idCard = request.idCard() == null || request.idCard().isBlank() ? null : request.idCard();
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhoneNumber(request.phoneNumber());
        user.setDateOfBirth(birthDate);
        user.setGender(request.gender());
        user.setCitizenId(idCard);
        user.setAddress(address == null || address.isEmpty() ? null : address);
        user.setRole(Role.KHACH_HANG);
        try {
            User saved = users.saveAndFlush(user);
            return new RegisterResponse(saved.getId(), saved.getUsername(), saved.getFullName(),
                    saved.getEmail(), saved.getRole().name());
        } catch (DataIntegrityViolationException exception) {
            // Ràng buộc UNIQUE của DB bắt trường hợp đăng ký đồng thời sau bước kiểm tra trùng ở trên.
            String detail = exception.getMostSpecificCause().getMessage();
            if (detail != null) {
                detail = detail.toLowerCase(Locale.ROOT);
                if (detail.contains("tai_khoan")) {
                    throw BusinessException.forField(ErrorCode.USERNAME_EXISTS, "username");
                }
                if (detail.contains("email")) {
                    throw BusinessException.forField(ErrorCode.EMAIL_EXISTS, "email");
                }
                if (detail.contains("so_dien_thoai")) {
                    throw BusinessException.forField(ErrorCode.PHONE_EXISTS, "phoneNumber");
                }
            }
            throw exception;
        }
    }

    private void validateProfile(String fullName, String address, LocalDate birthDate, String password) {
        if (fullName.length() < 2) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "fullName", "Họ và tên phải có ít nhất 2 ký tự.");
        }
        if (address != null && !address.isEmpty() && address.length() < 5) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "address", "Địa chỉ phải có ít nhất 5 ký tự.");
        }
        int age = Period.between(birthDate, LocalDate.now()).getYears();
        if (age < 13 || age > 120) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "dateOfBirth", "Tuổi phải từ 13 đến 120.");
        }
        // BCrypt chỉ sử dụng tối đa 72 byte; kiểm tra byte UTF-8 để không cắt mất phần mật khẩu có dấu.
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "password", "Mật khẩu không được vượt quá 72 byte.");
        }
    }

    private void ensureNotRegistered(String username, String email, String phoneNumber) {
        if (users.existsByUsername(username)) {
            throw BusinessException.forField(ErrorCode.USERNAME_EXISTS, "username");
        }
        if (users.existsByEmail(email)) {
            throw BusinessException.forField(ErrorCode.EMAIL_EXISTS, "email");
        }
        if (users.existsByPhoneNumber(phoneNumber)) {
            throw BusinessException.forField(ErrorCode.PHONE_EXISTS, "phoneNumber");
        }
    }
}

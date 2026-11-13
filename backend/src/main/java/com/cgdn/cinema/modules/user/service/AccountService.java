package com.cgdn.cinema.modules.user.service;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.user.dto.response.AccountProfileResponse;
import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/** Đọc hồ sơ từ CSDL và chuyển sang dữ liệu được phép trả về cho client. */
@Service
public class AccountService {

    private final UserRepository userRepository;

    public AccountService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AccountProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        // Mã thành viên là cách hiển thị ID hiện có, chưa có cột riêng trong CSDL.
        return new AccountProfileResponse(
                String.format(Locale.ROOT, "TV%07d", user.getId()),
                user.getUsername(),
                user.getFullName(),
                user.getDateOfBirth(),
                user.getGender(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getCitizenId(),
                user.getAddress(),
                user.getLoyaltyPoints(),
                user.getCreatedAt()
        );
    }
}

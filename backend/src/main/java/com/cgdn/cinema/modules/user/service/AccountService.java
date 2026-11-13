package com.cgdn.cinema.modules.user.service;

import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.user.dto.request.UpdateAccountProfileRequest;
import com.cgdn.cinema.modules.user.dto.response.AccountProfileResponse;
import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.util.Locale;

/**
 * Quản lý hồ sơ người dùng: đọc thông tin tài khoản và cập nhật hồ sơ cá nhân.
 */
@Service
public class AccountService {

    private final UserRepository userRepository;
    private final Clock clock;

    @org.springframework.beans.factory.annotation.Autowired
    public AccountService(UserRepository userRepository, Clock clock) {
        this.userRepository = userRepository;
        this.clock = clock;
    }

    public AccountService(UserRepository userRepository) {
        this(userRepository, Clock.system(AppConstants.ZONE));
    }

    @Transactional(readOnly = true)
    public AccountProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return toProfileResponse(user);
    }

    @Transactional
    public AccountProfileResponse updateProfile(Long userId, UpdateAccountProfileRequest request) {
        if (request == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        // Từ chối mọi trường lạ hoặc trường chỉ đọc (kể cả khi gửi null), không âm thầm bỏ qua
        if (request.hasUnknownFields()) {
            String unknown = request.getUnknownFields().keySet().iterator().next();
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Trường '" + unknown + "' không được phép cập nhật.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        applyProfileUpdates(user, request);

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    private void applyProfileUpdates(User user, UpdateAccountProfileRequest request) {
        // fullName: bắt buộc nếu gửi lên; null, rỗng hoặc chỉ có khoảng trắng phải trả lỗi
        if (request.isFullNamePresent()) {
            String rawName = request.getFullName();
            if (rawName == null || rawName.trim().isEmpty()) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "fullName", "Họ và tên không được để trống.");
            }
            String fullName = rawName.trim();
            if (fullName.length() < 2) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "fullName", "Họ và tên phải có ít nhất 2 ký tự.");
            }
            if (fullName.length() > 150) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "fullName", "Họ và tên phải có 2-150 ký tự.");
            }
            user.setFullName(fullName);
        }

        // dateOfBirth: tùy chọn; gửi null thì xóa giá trị; nếu có ngày thì tuổi phải từ 13 đến 120
        if (request.isDateOfBirthPresent()) {
            LocalDate birthDate = request.getDateOfBirth();
            if (birthDate == null) {
                user.setDateOfBirth(null);
            } else {
                int age = Period.between(birthDate, LocalDate.now(clock)).getYears();
                if (age < 13 || age > 120) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, "dateOfBirth", "Tuổi phải từ 13 đến 120.");
                }
                user.setDateOfBirth(birthDate);
            }
        }

        // gender: tùy chọn; gửi null thì xóa giá trị; chỉ chấp nhận MALE, FEMALE, OTHER
        if (request.isGenderPresent()) {
            String rawGender = request.getGender();
            if (rawGender == null) {
                user.setGender(null);
            } else {
                String gender = rawGender.trim().toUpperCase(Locale.ROOT);
                if (!gender.matches("^(MALE|FEMALE|OTHER)$")) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, "gender", "Giới tính không hợp lệ.");
                }
                user.setGender(gender);
            }
        }

        // citizenId: tùy chọn; gửi null hoặc rỗng thì xóa; nếu có giá trị phải là 9 hoặc 12 chữ số
        if (request.isCitizenIdPresent()) {
            String rawId = request.getCitizenId();
            if (rawId == null || rawId.trim().isEmpty()) {
                user.setCitizenId(null);
            } else {
                String citizenId = rawId.trim();
                if (!citizenId.matches("^[0-9]{9}$|^[0-9]{12}$")) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, "citizenId", "CMND/CCCD phải gồm 9 hoặc 12 số.");
                }
                user.setCitizenId(citizenId);
            }
        }

        // address: tùy chọn; gửi null hoặc rỗng thì xóa; nếu có giá trị thì phải từ 5 đến 255 ký tự
        if (request.isAddressPresent()) {
            String rawAddress = request.getAddress();
            if (rawAddress == null || rawAddress.trim().isEmpty()) {
                user.setAddress(null);
            } else {
                String address = rawAddress.trim();
                if (address.length() < 5) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, "address", "Địa chỉ phải có ít nhất 5 ký tự.");
                }
                if (address.length() > 255) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR, "address", "Địa chỉ không được vượt quá 255 ký tự.");
                }
                user.setAddress(address);
            }
        }
    }

    private AccountProfileResponse toProfileResponse(User user) {
        // Mã thành viên là cách hiển thị ID hiện có (TV + 7 chữ số), chưa có cột riêng trong CSDL.
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

package com.cgdn.cinema.modules.user.service;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.user.dto.request.ChangePasswordRequest;
import com.cgdn.cinema.modules.user.dto.request.UpdateAccountProfileRequest;
import com.cgdn.cinema.modules.user.dto.response.AccountProfileResponse;
import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.util.Locale;

/**
 * Quản lý hồ sơ cá nhân và thông tin xác thực của người dùng hiện tại.
 */
@Service
public class AccountService {

    private final UserRepository userRepository;
    private final Clock clock;
    private final PasswordEncoder passwordEncoder;

    /**
     * Tạo dịch vụ tài khoản với kho người dùng, đồng hồ ứng dụng và encoder cấu hình.
     *
     * @param userRepository kho truy vấn và lưu người dùng
     * @param clock đồng hồ dùng để tính tuổi nhất quán
     * @param passwordEncoder encoder đang cấu hình cho xác thực
     */
    public AccountService(UserRepository userRepository, Clock clock, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.clock = clock;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Lấy hồ sơ tài khoản theo ID.
     *
     * @param userId ID lấy từ danh tính đã xác thực
     * @return hồ sơ tài khoản
     * @throws BusinessException nếu không tìm thấy người dùng
     */
    @Transactional(readOnly = true)
    public AccountProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return toProfileResponse(user);
    }

    /**
     * Áp dụng các trường được gửi trong yêu cầu PATCH lên hồ sơ hiện tại.
     *
     * @param userId ID lấy từ Security Principal, không lấy từ request body
     * @param request dữ liệu cập nhật hồ sơ
     * @return hồ sơ sau khi lưu
     * @throws BusinessException nếu request hoặc một trong các trường không hợp lệ
     */
    @Transactional
    public AccountProfileResponse updateProfile(Long userId, UpdateAccountProfileRequest request) {
        if (request == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        // @JsonAnySetter ghi nhận cả trường lạ gửi null, vì vậy từ chối thay vì âm thầm bỏ qua.
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

    /**
     * Đổi mật khẩu cho tài khoản có ID lấy từ Security Principal.
     *
     * <p>Thứ tự kiểm tra được giữ rõ ràng: từ chối trường ngoài hợp đồng, xác định tài khoản,
     * xử lý tài khoản Google chưa có mật khẩu, xác minh mật khẩu hiện tại rồi mới kiểm tra
     * mật khẩu mới và xác nhận. Entity chỉ được sửa và lưu sau khi mọi kiểm tra đều thành công,
     * vì vậy các lỗi nghiệp vụ không làm thay đổi hash đang lưu.</p>
     *
     * <p>Mật khẩu mới được giới hạn 72 byte UTF-8 để tránh giới hạn cắt đầu vào của BCrypt;
     * số ký tự được đếm theo Unicode code point thay vì số đơn vị UTF-16 của Java String.</p>
     *
     * @param userId ID của tài khoản hiện tại lấy từ JWT principal, không lấy từ request body
     * @param request mật khẩu hiện tại, mật khẩu mới và giá trị xác nhận do client gửi
     * @throws BusinessException nếu request, thông tin xác thực hoặc chính sách mật khẩu không hợp lệ
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        if (request == null || !request.getUnknownFields().isEmpty()) {
            // Từ chối userId và mọi trường ngoài hợp đồng để client không thể chọn tài khoản đích.
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.getPassword() == null) {
            // Google account chưa có mật khẩu không được thiết lập lần đầu qua API đổi mật khẩu.
            throw new BusinessException(ErrorCode.GOOGLE_PASSWORD_NOT_SET);
        }
        // Xác minh mật khẩu hiện tại bằng encoder đang dùng cho đăng nhập; không so sánh hash thủ công.
        if (request.getCurrentPassword() == null
                || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.CURRENT_PASSWORD_INVALID);
        }

        String newPassword = request.getNewPassword();
        // Giữ nguyên mật khẩu client gửi; không trim hoặc chuẩn hóa vì việc đó sẽ đổi credential.
        if (newPassword == null || newPassword.codePointCount(0, newPassword.length()) < 8
                || !newPassword.matches(".*[a-z].*")
                || !newPassword.matches(".*[A-Z].*")
                || !newPassword.matches(".*[0-9].*")
                // BCrypt chỉ dùng tối đa 72 byte đầu vào; kiểm tra UTF-8 để giới hạn đúng cả Unicode.
                || newPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "newPassword",
                    "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, chữ số và tối đa 72 byte UTF-8.");
        }
        if (!newPassword.equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "confirmPassword",
                    "Mật khẩu xác nhận không khớp.");
        }

        // Chỉ lưu hash sau khi mọi kiểm tra qua; không ghi mật khẩu rõ hoặc hash ra log/response.
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /** Cập nhật từng trường được phép, chỉ khi trường đó có mặt trong JSON. */
    private void applyProfileUpdates(User user, UpdateAccountProfileRequest request) {
        // Họ tên bắt buộc khi được gửi; sau trim độ dài phải từ 2 đến 150 ký tự.
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

        // Tuổi được tính theo Clock của ứng dụng để quy tắc 13–120 ổn định theo múi giờ hệ thống.
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

        // Chuẩn hóa giới tính không phân biệt hoa thường; chỉ nhận MALE, FEMALE hoặc OTHER.
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

        // CCCD tùy chọn; null/rỗng xóa giá trị, còn lại phải đúng 9 hoặc 12 chữ số.
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

        // Địa chỉ tùy chọn; null/rỗng xóa giá trị, nội dung sau trim dài từ 5 đến 255 ký tự.
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

    /** Chuyển thực thể người dùng thành response hồ sơ theo hợp đồng API hiện tại. */
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

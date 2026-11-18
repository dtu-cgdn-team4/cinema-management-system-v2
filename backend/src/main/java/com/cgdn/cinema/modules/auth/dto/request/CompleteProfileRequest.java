package com.cgdn.cinema.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

/**
 * Yêu cầu bổ sung thông tin bắt buộc (SĐT, Ngày sinh, Giới tính) sau khi đăng nhập Google.
 * Cho phép người dùng chỉnh sửa/bổ sung thêm họ tên, CCCD/CMND, địa chỉ đồng bộ với biểu mẫu đăng ký.
 */
public record CompleteProfileRequest(
        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(regexp = "^(0[35789])[0-9]{8}$", message = "Số điện thoại không đúng định dạng Việt Nam (10 chữ số)")
        String phoneNumber,

        @NotNull(message = "Ngày sinh không được để trống")
        @Past(message = "Ngày sinh phải là ngày trong quá khứ")
        LocalDate dateOfBirth,

        @NotBlank(message = "Giới tính không được để trống")
        String gender,

        String fullName,

        @Pattern(regexp = "^(\\s*|[0-9]{9}|[0-9]{12})$", message = "CMND/CCCD phải gồm 9 hoặc 12 số.")
        String idCard,

        String address
) {
    public CompleteProfileRequest(String phoneNumber, LocalDate dateOfBirth, String gender) {
        this(phoneNumber, dateOfBirth, gender, null, null, null);
    }
}


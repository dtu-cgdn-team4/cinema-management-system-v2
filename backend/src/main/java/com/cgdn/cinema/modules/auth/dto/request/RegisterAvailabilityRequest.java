package com.cgdn.cinema.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Thông tin cần kiểm tra tính duy nhất trước khi gửi OTP. */
public record RegisterAvailabilityRequest(
        @NotBlank(message = "Vui lòng nhập tên đăng nhập.")
        @Pattern(regexp = "[A-Za-z0-9_]{3,30}", message = "Tên đăng nhập không hợp lệ.")
        String username,
        @NotBlank(message = "Vui lòng nhập email.")
        @Pattern(regexp = "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", message = "Email không hợp lệ.")
        @Size(max = 254, message = "Email quá dài.")
        String email,
        @NotBlank(message = "Vui lòng nhập số điện thoại.")
        @Pattern(regexp = "0[35789][0-9]{8}", message = "Số điện thoại không hợp lệ.")
        String phoneNumber) {
}

package com.cgdn.cinema.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank(message = "Vui lòng nhập tên đăng nhập.")
        @Pattern(regexp = "[A-Za-z0-9_]{3,30}", message = "Tên đăng nhập phải có 3-30 ký tự chữ, số hoặc dấu gạch dưới.")
        String username,
        @NotBlank(message = "Vui lòng nhập họ và tên.")
        @Size(min = 2, max = 150, message = "Họ và tên phải có 2-150 ký tự.")
        String fullName,
        @NotBlank(message = "Vui lòng nhập email.")
        @Pattern(regexp = "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", message = "Email không đúng định dạng.")
        @Size(max = 254, message = "Email quá dài.")
        String email,
        @NotBlank(message = "Vui lòng nhập số điện thoại.")
        @Pattern(regexp = "0[35789][0-9]{8}", message = "Số điện thoại phải gồm 10 số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.")
        String phoneNumber,
        @NotNull(message = "Vui lòng chọn ngày sinh.")
        LocalDate dateOfBirth,
        @NotBlank(message = "Vui lòng chọn giới tính.")
        @Pattern(regexp = "MALE|FEMALE|OTHER", message = "Giới tính không hợp lệ.")
        String gender,
        @NotBlank(message = "Vui lòng tạo mật khẩu.")
        @Pattern(regexp = "(?s)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}",
                message = "Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.")
        String password,
        @Pattern(regexp = "[0-9]{9}|[0-9]{12}", message = "CMND/CCCD phải gồm 9 hoặc 12 số.")
        String idCard,
        @Size(min = 5, max = 255, message = "Địa chỉ phải có 5-255 ký tự.")
        String address) {
}

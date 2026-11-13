package com.cgdn.cinema.modules.user.dto.request;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Dữ liệu đổi mật khẩu của tài khoản đang đăng nhập.
 * Request chỉ chứa ba mật khẩu; mọi thuộc tính khác, gồm cả userId, được ghi nhận
 * để service từ chối thay vì bỏ qua âm thầm.
 */
public class ChangePasswordRequest {

    private String currentPassword;
    private String newPassword;
    private String confirmPassword;

    @JsonIgnore
    private final Set<String> unknownFields = new LinkedHashSet<>();

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    @JsonAnySetter
    public void captureUnknownField(String name, Object value) {
        // Giữ tên trường lạ để service trả lỗi hợp đồng; không lưu lại giá trị có thể nhạy cảm.
        unknownFields.add(name);
    }

    /** @return tập tên trường ngoài hợp đồng, không cho bên gọi sửa trực tiếp */
    @JsonIgnore
    public Set<String> getUnknownFields() {
        return Set.copyOf(unknownFields);
    }
}

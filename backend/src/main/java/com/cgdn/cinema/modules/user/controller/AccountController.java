package com.cgdn.cinema.modules.user.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.user.dto.request.UpdateAccountProfileRequest;
import com.cgdn.cinema.modules.user.dto.response.AccountProfileResponse;
import com.cgdn.cinema.modules.user.service.AccountService;
import com.cgdn.cinema.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Cung cấp API đọc và cập nhật hồ sơ của tài khoản đang đăng nhập.
 * Danh tính tài khoản luôn được lấy từ Security Principal.
 */
@Tag(name = "Account", description = "API quản lý thông tin tài khoản cá nhân")
@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    private final AccountService accountService;

    /** Tạo controller sử dụng dịch vụ hồ sơ tài khoản. */
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Trả về hồ sơ của tài khoản hiện tại.
     *
     * @param userDetails thông tin người dùng được xác thực trong Security Context
     * @return hồ sơ tài khoản hiện tại
     * @throws BusinessException nếu không có người dùng đã xác thực
     */
    @Operation(summary = "Xem thông tin hồ sơ của tài khoản đang đăng nhập")
    @GetMapping("/me")
    public ApiResponse<AccountProfileResponse> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        // Chỉ dùng ID từ phiên đăng nhập, không nhận ID tài khoản từ client.
        return ApiResponse.success(accountService.getProfile(userDetails.getId()));
    }

    /**
     * Cập nhật các trường hồ sơ được phép của tài khoản hiện tại.
     *
     * @param userDetails thông tin người dùng được xác thực trong Security Context
     * @param request các trường hồ sơ cần cập nhật
     * @return hồ sơ sau khi cập nhật
     * @throws BusinessException nếu không có người dùng đã xác thực hoặc dữ liệu không hợp lệ
     */
    @Operation(summary = "Cập nhật thông tin hồ sơ cá nhân của tài khoản đang đăng nhập")
    @PatchMapping("/me")
    public ApiResponse<AccountProfileResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UpdateAccountProfileRequest request) {
        if (userDetails == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        // Chỉ cập nhật tài khoản lấy từ principal; không nhận userId từ request.
        return ApiResponse.success(accountService.updateProfile(userDetails.getId(), request));
    }
}

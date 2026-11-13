package com.cgdn.cinema.modules.ticket.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.ticket.dto.response.MemberTicketListResponse;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.BookingView;
import com.cgdn.cinema.modules.ticket.service.MemberTicketService;
import com.cgdn.cinema.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasRole('USER')")
public class MemberTicketController {

    private final MemberTicketService service;

    public MemberTicketController(MemberTicketService service) {
        this.service = service;
    }

    @GetMapping("/api/me/bookings")
    @Operation(summary = "Danh sách vé đã mua của thành viên đang đăng nhập")
    public ApiResponse<MemberTicketListResponse> getBookings(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "view", defaultValue = "ALL") BookingView view) {
        if (principal == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return ApiResponse.success(service.getBookings(principal.getId(), page, size, view));
    }
}

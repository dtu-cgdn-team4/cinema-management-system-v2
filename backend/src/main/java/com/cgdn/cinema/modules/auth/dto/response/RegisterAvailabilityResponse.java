package com.cgdn.cinema.modules.auth.dto.response;

import java.util.Map;

/** Các trường bị trùng; map rỗng nghĩa là có thể tiếp tục đăng ký. */
public record RegisterAvailabilityResponse(boolean available, Map<String, String> errors) {}

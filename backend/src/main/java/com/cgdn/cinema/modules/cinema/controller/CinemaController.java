package com.cgdn.cinema.modules.cinema.controller;

import java.util.List;
import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.modules.cinema.dto.response.CinemaResponse;
import com.cgdn.cinema.modules.cinema.service.CinemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cinemas")
@RequiredArgsConstructor
public class CinemaController {

    private final CinemaService cinemaService;

    @GetMapping
    public ApiResponse<List<CinemaResponse>> getCinemas() {
        return ApiResponse.ok(cinemaService.getCinemas());
    }
}

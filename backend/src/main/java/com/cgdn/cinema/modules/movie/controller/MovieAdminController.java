package com.cgdn.cinema.modules.movie.controller;

import com.cgdn.cinema.common.response.ApiResponse;
import com.cgdn.cinema.common.response.PageResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieAdminResponse;
import com.cgdn.cinema.modules.movie.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/movies")
@RequiredArgsConstructor
@Tag(name = "Admin Movie", description = "Quản lý phim dành cho quản trị viên")
@PreAuthorize("hasRole('ADMIN')")
public class MovieAdminController {

    private final MovieService movieService;

    /** Trả danh sách phim, hỗ trợ lọc theo từ khóa, thể loại, trạng thái và phân trang. */
    @GetMapping
    @Operation(summary = "Lấy danh sách phim cho Admin (có phân trang, tìm kiếm gần đúng và lọc)")
    public ApiResponse<PageResponse<MovieAdminResponse>> getMovies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long theLoaiId,
            @RequestParam(required = false) String status,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(movieService.getMovies(keyword, theLoaiId, status, pageable));
    }

    /** Chuyển phim sang trạng thái ngừng chiếu mà không xóa dữ liệu lịch sử. */
    @DeleteMapping("/{id}")
    @Operation(summary = "Ngừng chiếu phim (xóa mềm)")
    public ApiResponse<Void> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ApiResponse.success("Ngừng chiếu bộ phim thành công", null);
    }
}


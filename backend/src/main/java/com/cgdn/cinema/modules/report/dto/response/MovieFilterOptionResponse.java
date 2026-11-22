package com.cgdn.cinema.modules.report.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Danh sách lựa chọn cho bộ lọc Thống kê: Rạp và Phim
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieFilterOptionResponse {

    private List<FilterOptionItem> cinemas;
    private List<FilterOptionItem> movies;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterOptionItem {
        private Long id;
        private String name;
    }
}

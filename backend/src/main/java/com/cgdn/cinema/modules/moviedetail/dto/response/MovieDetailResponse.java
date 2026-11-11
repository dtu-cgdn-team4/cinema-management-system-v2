package com.cgdn.cinema.modules.moviedetail.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class MovieDetailResponse {

    Long id;
    String title;
    String posterUrl;

    @Schema(description = "Chưa có cột dữ liệu tên gốc, ảnh nền hoặc ngôn ngữ phụ đề trong schema hiện tại")
    String originalTitle;
    String backdropUrl;
    String subtitle;

    @Schema(description = "Danh sách rỗng khi database chưa có thư viện ảnh phim")
    List<String> galleryImages;

    String director;
    List<String> actors;
    List<GenreResponse> genres;

    @Schema(description = "Thời lượng phim, đơn vị phút")
    Integer duration;

    LocalDate releaseDate;
    LocalDate endDate;
    String productionCompany;

    @Schema(description = "Trạng thái chiếu suy ra từ ngày khởi chiếu/kết thúc theo Asia/Ho_Chi_Minh")
    MovieScreeningStatus screeningStatus;

    @Schema(description = "Phạm vi dự án chỉ chiếu 2D theo docs/database/database.md")
    String format;

    String ageRating;
    String description;
    String trailerUrl;

    @Schema(description = "Cờ dữ liệu: 1 = hoạt động, 2 = đã xóa mềm (không được trả về)")
    Byte status;

    @Schema(description = "Suất chiếu chưa bắt đầu tại phòng và rạp đang hoạt động")
    List<ShowtimeResponse> showtimes;

    @Value
    @Builder
    public static class GenreResponse {
        Long id;
        String name;
    }

    @Value
    @Builder
    public static class ShowtimeResponse {
        Long id;
        Long roomId;
        String roomName;
        Long cinemaId;
        String cinemaName;
        String cinemaCity;
        String cinemaAddress;

        @Schema(description = "Giờ bắt đầu tại Asia/Ho_Chi_Minh")
        LocalDateTime startsAt;

        @Schema(description = "Giờ kết thúc tại Asia/Ho_Chi_Minh, bao gồm thời gian dọn phòng")
        LocalDateTime endsAt;

        @Schema(description = "Giờ hết phim = giờ bắt đầu + thời lượng phim, không gồm dọn phòng")
        LocalDateTime movieEndsAt;
    }
}

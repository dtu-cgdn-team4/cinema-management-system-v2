package com.cgdn.cinema.modules.moviedetail.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class MovieShowtimesResponse {
    Long movieId;
    LocalDate date;
    String city;
    Long cinemaId;
    String currency;
    List<LocalDate> availableDates;
    List<String> cities;
    List<CinemaResponse> cinemas;
    List<RoomResponse> rooms;

    @Value
    @Builder
    public static class CinemaResponse {
        Long id;
        String name;
        String city;
        String address;
    }

    @Value
    @Builder
    public static class RoomResponse {
        Long id;
        String name;
        String format;
        List<SeatPriceResponse> prices;
        List<SlotResponse> showtimes;
    }

    @Value
    @Builder
    public static class SeatPriceResponse {
        String seatType;

        @Schema(description = "Giá vé VND từ bang_gia theo thứ ISO và loại ghế; null nếu chưa cấu hình")
        BigDecimal amount;
    }

    @Value
    @Builder
    public static class SlotResponse {
        Long id;
        LocalDateTime startsAt;
        LocalDateTime endsAt;
        LocalDateTime movieEndsAt;
        long totalSeats;

        @Schema(description = "Ảnh chụp số ghế trống tại lúc truy vấn; không phải thao tác giữ ghế")
        long availableSeats;

        boolean soldOut;
    }
}
